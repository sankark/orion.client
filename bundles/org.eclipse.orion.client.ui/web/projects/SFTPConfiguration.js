/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: Anton McConville - IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global orion window console define localStorage*/
/*jslint browser:true*/

define(['i18n!orion/settings/nls/messages', 'require', 'projects/DriveList', 'orion/commands', 'projects/ProjectDataManager' ], 
	
	function(messages, require, DriveList, mCommands, ProjectDataManager ) {

		function SFTPConfiguration( project, node, projectData, commandService, serviceRegistry ){
		
			this.commandService = commandService;
			this.serviceRegistry = serviceRegistry;
			this.anchorNode = node;
			this.anchorNode.innerHTML = this.template;	
			this.projectNode = this.anchorNode.firstChild;
//			this.showProjectConfiguration( this.listNode );	
			
			var drivelist = document.createElement( 'div' );
			this.projectData = project;
			
			this.projectNode.appendChild( drivelist );

			this.driveWidget = new DriveList( {}, drivelist, commandService, serviceRegistry );
			
//			this.projectDataManager = new ProjectDataManager( serviceRegistry );
			this.driveWidget.show();
			/* Read project name from url */
			
//			var projectName = '';
			
//			this.projectData = this.projectDataManager.getProject( projectName );

			/* Set up drives */
			
			var driveListContainer = this.driveWidget;
			
			var saveConfigCommand = new mCommands.Command({
				name: 'Save', //messages["Install"],
				tooltip: 'Saves configuration',
				id: "orion.saveProjectConfig", //$NON-NLS-0$
				callback: function(data) {
					console.log( 'new project' );
					driveListContainer.newDrive();
				}.bind(this)
			});
			
			this.commandService.addCommand(saveConfigCommand);
			this.commandService.registerCommandContribution("configurationCommands", "orion.saveProjectConfig", 1, /* not grouped */ null, false, /* no key binding yet */ null, null ); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			this.commandService.renderCommands("configurationCommands", "configurationCommands", this, this, "button"); //$NON-NLS-0$
			
			var drivelist = document.createElement( 'div' );
			this.projectNode.appendChild( drivelist );

			if( project ){	
			
				this.setProjectName( project.name );
			
				this.setProjectAddress( project.path );
			
				for( var d = 0; d < project.drives.length; d++ ){
					this.driveWidget.newDrive( project.drives[d] );
					this.driveWidget.addRows();
				}
			}else{
				this.driveWidget.newDrive();
				this.driveWidget.addRows();
			}
		}


		var template =	'<div id="configuration" class="projectConfiguration" role="tabpanel" style="padding-left:30px;max-width: 700px; min-width: 500px;" aria-labelledby="userSettings">' +	
							'<div class="sectionWrapper toolComposite">' +
									'<div class="sectionAnchor sectionTitle layoutLeft">Configuration</div>' + 
									'<div id="userCommands" class="layoutRight sectionActions"></div>' +
									'<div id="configurationCommands" class="configurationCommands layoutRight sectionActions"></div>' +
							'</div>' + //$NON-NLS-2$ //$NON-NLS-0$
							
							'<section class="setting-row" role="region" aria-labelledby="Navigation-header">' +
								'<h3 class="setting-header" data-dojo-attach-point="titleNode">Details</h3>' +
								'<div class="setting-content">' +
									'<div class="setting-property">' +  //$NON-NLS-0$
										'<label>' + //$NON-NLS-0$
											'<span class="setting-label">Project Name:</span>' + //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
											'<input id="projectName" class="setting-control" type="text" name="myname">' + //$NON-NLS-0$
										'</label>' +  //$NON-NLS-0$
									'</div>' +
									'<div class="setting-property">' +  //$NON-NLS-0$
										'<label>' + //$NON-NLS-0$
											'<span class="setting-label">Project URL:</span>' + //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
											'<input id="projectAddress" class="setting-control" type="text" name="myname">' + //$NON-NLS-0$
										'</label>' +  //$NON-NLS-0$
									'</div>' +
								'</div>' +
							'</section>' +
						'</div>';							
											
		SFTPConfiguration.prototype.template = template;
		
		function showProjectConfiguration(parent, name){

		}

		function setProjectName( projectname ){
			var nameNode = document.getElementById( "projectName" );
			nameNode.value = projectname;
		}
		
		function getProjectName(){
			var name;
			var nameNode = document.getElementById( "projectName" );
			name = nameNode.value;
			return name;
		}
		
		function setProjectAddress( projectaddress ){
			var addressNode = document.getElementById( "projectAddress" );
			addressNode.value = projectaddress;
		}
		
		function getProjectAddress(){
			var address;
			var addressNode = document.getElementById( "projectAddress" );
			address = addressNode.value;
			return name;
		}
		
		
		SFTPConfiguration.prototype.showProjectConfiguration = showProjectConfiguration;
		SFTPConfiguration.prototype.setProjectName = setProjectName;
	 	SFTPConfiguration.prototype.setProjectAddress = setProjectAddress;	

		return SFTPConfiguration;
	}
);