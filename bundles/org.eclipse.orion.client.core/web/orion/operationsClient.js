/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 /*globals define console setTimeout*/
define(['i18n!orion/operations/nls/messages', "orion/Deferred"], function(messages, Deferred){
	
	function _doServiceCall(operationsService, funcName, funcArgs) {
		var clientDeferred = new Deferred();
		operationsService[funcName].apply(operationsService, funcArgs).then(
			//on success, just forward the result to the client
			function(result) {
				clientDeferred.resolve(result);
			},
			//on failure we might need to retry
			function(error) {
				//forward other errors to client
				clientDeferred.reject(error);
			},
			function(progress) {
				clientDeferred.progress(progress);
			}
		);
		return clientDeferred;
	}
	
	function _getOperations(operationsService, options){
		return _doServiceCall(operationsService, "getOperations", [options]); //$NON-NLS-0$
	}
	
	function NoMatchingOperationsClient(location){
		this._location = location;
	}
	
	function returnNoMatchingError(){
		var result = new Deferred();
		result.reject(messages["No Matching OperationService for location:"] + this._location);
		return result;
	}
	
	NoMatchingOperationsClient.prototype = {
			getOperation: returnNoMatchingError,
			getOperations: returnNoMatchingError,
			removeCompletedOperations: returnNoMatchingError,
			removeOperation: returnNoMatchingError,
			cancelOperation: returnNoMatchingError
	};
	
	NoMatchingOperationsClient.prototype.constructor = NoMatchingOperationsClient;
	
	function OperationsClient(serviceRegistry){
		this._services = [];
		this._patterns = [];
		this._operationListeners = [];
		this._currentLongpollingIds = [];
		this._preferenceService = serviceRegistry.getService("orion.core.preference"); //$NON-NLS-0$
		var operationsServices = serviceRegistry.getServiceReferences("orion.core.operation"); //$NON-NLS-0$
		for(var i=0; i<operationsServices.length; i++){
			var servicePtr = operationsServices[i];
			var operationsService = serviceRegistry.getService(servicePtr);
			this._services[i] = operationsService;
			
			var patternString = operationsServices[i].getProperty("pattern") || ".*"; //$NON-NLS-1$ //$NON-NLS-0$
			if (patternString[0] !== "^") { //$NON-NLS-0$
				patternString = "^" + patternString; //$NON-NLS-0$
			}
			this._patterns[i] = new RegExp(patternString);
		}
		
		this._getService = function(location) {
			if (!location) {
				return this._services[0];
			}
			for(var i = 0; i < this._patterns.length; ++i) {
				if (this._patterns[i].test(location)) {
					return this._services[i];
				}
			}
			return new NoMatchingOperationsClient(location);
		};
	}
	
	function _mergeOperations(lists){
		var result = {Children: []};
		for(var i=0; i < lists.length; i++){
			result.Children = result.Children.concat(lists[i].Children);
		}
		return result;
	}
	
	function _registerOperationChangeListener(service, listener, longpollingId){
		var that = this;
		var args = {Longpolling: true};
		if(longpollingId){
			args.LongpollingId = longpollingId;
		}
		_doServiceCall(service, "getOperations", [args]).then(function(result){ //$NON-NLS-0$
			if(longpollingId && that._currentLongpollingIds.indexOf(longpollingId)<0){
				return;
			}
			listener(result, longpollingId);
			if(result.LongpollingId){
				that._currentLongpollingIds.push(result.LongpollingId);
				_registerOperationChangeListener.bind(that)(service, listener, result.LongpollingId);
			} else {
				_registerOperationChangeListener.bind(that)(service, listener, longpollingId);
			}
			
		}, function(error){
			if(longpollingId && that._currentLongpollingIds.indexOf(longpollingId)<0){
				return;
			}
			setTimeout(function(){_registerOperationChangeListener.bind(that)(service, listener, longpollingId);}, 2000); //TODO display error and ask user to retry rather than retry every 2 sec
		});
	}
	
	function _notifyChangeListeners(result){
		for(var i=0; i<this._operationListeners.length; i++){
			this._operationListeners[i](result);
		}
	}
	
	OperationsClient.prototype = {
			getOperations: function(){
				var def = new Deferred();
				if(this._operations){
					def.resolve(this._operations);
					return def;
				}
				var that = this;
				this._preferenceService.getPreferences("/operations").then(function(globalOperations){
					that._operations = globalOperations;
					def.resolve(that._operations);
				});
				return def;
			},
			getOperation: function(operationLocation){
				return _doServiceCall(this._getService(operationLocation), "getOperation", arguments); //$NON-NLS-0$
			},
			removeCompletedOperations: function(){
				var results = [];
				var that = this;
				for(var i=0; i<this._services.length; i++){
					var pattern = this._patterns[i];
					var def = new Deferred();
					results[i] = def.promise;
					_doServiceCall(this._services[i], "removeCompletedOperations").then(function(def){
						return function(operationsLeft){
						if(!Array.isArray(operationsLeft)){
							return;
						}
						that.getOperations.bind(that)().then(function(globalOperations){
							var operationLocations = globalOperations.keys();
							for(var j=0; j<operationLocations.length; j++){
								var location = operationLocations[j];
								if (pattern.test(location)) {
									if(operationsLeft.indexOf(location)<0){
										globalOperations.remove(location);
									}
								}
							}
							def.resolve();
						});
					};}(def), function(def){return function(error){
						def.reject(error);
					};}(def));
				}
				return Deferred.all(results);
			},
			
			removeOperation: function(operationLocation){
				var that = this;
				return _doServiceCall(this._getService(operationLocation), "removeOperation", arguments).then(function(result){
					that.getOperations.bind(that)().then(function(globalOperations){
						globalOperations.remove(operationLocation);
					});
				}, function(progress){return progress;}, function(error){return error;}); //$NON-NLS-0$
			}
	};
	
	OperationsClient.prototype.constructor = OperationsClient;
	
	return {OperationsClient: OperationsClient};
});