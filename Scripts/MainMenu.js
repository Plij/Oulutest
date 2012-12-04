//!ref: local:\\Scripts\Background.ui
//!ref: local:\\Scripts\MainMenu.ui
//!ref: local:\\Scripts\Prop.ui
//!ref: local:\\Scripts\Scene.ui

//!ref: local:\\Props\Sun.txml
//!ref: local:\\Props\PalmTrees.txml
//!ref: local:\\Props\Beach.txml
//!ref: local:\\Props\DaySky.txml


engine.ImportExtension("qt.core");
engine.ImportExtension("qt.gui");
//engine.ImportExtension("qt.uitools");

/* 
 *	MainMenu includes the submenus(background, prop, scene, clearMenu, clearEntity) 
 *  When you click the buttons ( background, prop, scene) on the interface of MainMenu, it will popup the corresponding submenu at right side of MainMenu
 *  when you click the button (clearMenu) on the interface of MainMenu, it will hind the submenu in the screen
 *  when you click the button (clearEntity) on the interface of MainMenu, it will clear all the entities in the scene. 
 */

var SceneList_visible = false;
var PropList_visible = false;
var BackgroundList_visible = false;
var CurrentClickedItemName = null;

var PropProxy = null;
var SceneProxy = null;
var BackgroundProxy = null;

var _SceneListWidget = null;
var _PropListWidget = null;
var _BackgroundListWidget  = null;


function Init()
{
// load the file "MainMenu.ui"   
 	var _widget = ui.LoadFromFile("Scripts/MainMenu.ui", false);
 	
 	var _PropBtn = findChild(_widget, "PropBtn");
	_PropBtn.pressed.connect(PropBtnClicked);					// listening to the singal of prop button clicked
	
 	var _SceneBtn = findChild(_widget, "SceneBtn");				
	_SceneBtn.pressed.connect(SceneBtnClicked);					// listening to the singal of SceneBtn button clicked
	
	var _BackgroundBtn = findChild(_widget, "BackgroundBtn");  
	_BackgroundBtn.pressed.connect(BackgroundBtnClicked);		// listening to the singal of background button clicked
	
 	var _ClearMenuBtn = findChild(_widget, "ClearMenuBtn");				
	_ClearMenuBtn.pressed.connect(ClearMenuBtnClicked);			// listering to the singal of clean menu button clicked
	
	var _ClearEntityBtn = findChild(_widget,"ClearEntityBtn");
	_ClearEntityBtn.pressed.connect(RemoveAllEntities);		// listering to the singal of clean entity button clicked
	
 	var MenuProxy = new UiProxyWidget(_widget);
 
 	ui.AddProxyWidgetToScene(MenuProxy);
    MenuProxy.visible = true;
    MenuProxy.windowFlags = 0;
	
	MenuProxy.x = 860;
	MenuProxy.y = 25;
	
// load the file "Scene.ui"	
	var _SceneWidget = ui.LoadFromFile("Scripts/Scene.ui", false);
	
    _SceneListWidget = findChild(_SceneWidget, "SceneListWidget");
	_SceneListWidget.itemDoubleClicked.connect(SceneListItemDoubleClicked);
	
    SceneProxy = new UiProxyWidget(_SceneWidget);
    
    ui.AddProxyWidgetToScene(SceneProxy);
    SceneProxy.visible = SceneList_visible;   // set the SceneList_visibe = false;
    SceneProxy.windowFlags = 0;
    
    SceneProxy.x = 965;             // they should be caculated late
    SceneProxy.y = 25;


// load the file "Prop.ui"
	var _PropWidget = ui.LoadFromFile("Scripts/Prop.ui", false);
	
	_PropListWidget = findChild(_PropWidget,"PropListWidget");
	_PropListWidget.itemDoubleClicked.connect(PropListItemDoubleClicked);           // listen to the event of item double clicked in PropListWidget
	 
	PropProxy = new UiProxyWidget(_PropWidget);
	
	ui.AddProxyWidgetToScene(PropProxy);
	PropProxy.visible = PropList_visible;
	PropProxy.windowFlags = 0;
    
    PropProxy.x = 965;             // they should be caculated late
    PropProxy.y = 25;
	
// load the file "Background.ui"
	var _BackgroundWidget = ui.LoadFromFile("Scripts/Background.ui", false);
	
	_BackgroundListWidget = findChild(_BackgroundWidget,"BackgroundListWidget");
	_BackgroundListWidget.itemDoubleClicked.connect(BackgroundListItemDoubleClicked);   // listen to the event of item double clicked in BackgroundListWidget
	
	BackgroundProxy = new UiProxyWidget(_BackgroundWidget);
	
	ui.AddProxyWidgetToScene(BackgroundProxy);
	BackgroundProxy.visible = BackgroundList_visible;
	BackgroundProxy.windowFlags = 0;
    
    BackgroundProxy.x = 965;             // they should be caculated late
    BackgroundProxy.y = 25;
	
	
}

/*
 *  handle the mouse event occur on submenu (scene, prop, background, clear).
 *  currently, just implement the effect that click the button once , the submenu will be shown, click the button again, the submenu disappear, do the loop like that 
 */
 
	function SceneBtnClicked(){
		
			SceneProxy.visible = true;
			
			PropProxy.visible = ! SceneProxy.visible;
			BackgroundProxy.visible = ! SceneProxy.visible;
	}
	

    function PropBtnClicked(){
		
			PropProxy.visible = true;
			
			SceneProxy.visible = ! PropProxy.visible;
			BackgroundProxy.visible = ! PropProxy.visible;
	}
	

	function BackgroundBtnClicked(){
			
			BackgroundProxy.visible  = true;
			
			SceneProxy.visible = ! BackgroundProxy.visible;
			PropProxy.visible = ! BackgroundProxy.visible;
	}

	function ClearMenuBtnClicked(){
		
		SceneProxy.visible = false;
		PropProxy.visible = false;
		BackgroundProxy.visible = false;
	}
 	
	




/* 
 * handle the mouse event occur on the submenu
 *
 */
 // how to get the object name from the ListWidget, actully, Object name = ListWidget.item[index].text()    Is this syntax right?
	// 	how to get the number of index
  

 	function SceneListItemDoubleClicked(){
		
		CurrentClickedItemName = _SceneListWidget.currentItem().text();
		console.LogInfo(_SceneListWidget.objectName);
		console.LogInfo("CurrentClicked        SceceListItem: " + CurrentClickedItemName);
		CheckSelected(CurrentClickedItemName);
	}

	function PropListItemDoubleClicked (){
		
		CurrentClickedItemName = _PropListWidget.currentItem().text();
		console.LogInfo(_PropListWidget.objectName);
		console.LogInfo("CurrentClicked        PropListItem: " + CurrentClickedItemName);
		CheckSelected(CurrentClickedItemName);
	
		
	}
	
	function BackgroundListItemDoubleClicked (){
		CurrentClickedItemName = _BackgroundListWidget.currentItem().text();
		console.LogInfo(_BackgroundListWidget.objectName);
		console.LogInfo("CurrentClicked        BackgroundListItem: " + CurrentClickedItemName);
		CheckSelected(CurrentClickedItemName);
	}
	
	


function CheckSelected (text){
  //Need to check if all props in one or separate arrays. These have to match the files in Props folder to work.
  //Also maybe make the URL a bit more generic to be easier to use anywhere.
				   
    //Just for demo purpose, use the one above in real 1
   var effectArray = ["Beach", "PalmTrees", "Sun", "DaySky"];
  
  if(text == null || text == ""){
	  console.LogInfo("You havn't selected any effect");
  }
  else
  {
	  for(j=0; j<effectArray.length; j++)
	  {
			text = text.split(' ').join('');
			if(effectArray[j] == text)
			{
			  //print(effectArray[j] + '.txml', text);
			  //console.LogInfo(effectArray[j] + '.txml' + 'is ready');
			  var assets = scene.LoadSceneXML(asset.GetAsset("local://Props/" + text + ".txml").DiskSource(), false, false, 0);
			  var ent = assets[0];
			  //Make sure all entities are also named with the same name as their filenames!!!
			  
        if(!ent.animationcontroller){
          if(ent.dynamiccomponent.name == "Prop" && ent.dynamiccomponent.name == "prop"){
             var tm = ent.placeable.transform;
             tm.pos.x = -64.83;
             tm.pos.y = 8.07;
             tm.pos.z = -79.25; 
             ent.placeable.transform = tm;
          }else if (ent.dynamiccomponent.name == "Scene" && ent.dynamiccomponent.name == "scene"){
            var tm = ent.placeable.transform;
            tm.pos.x = -58.98;
            tm.pos.y = 8.25;
            tm.pos.z = -73.77; 
            ent.placeable.transform = tm;
          }else if(ent.dynamiccomponent.name == "BackGround"){
          /*
          Add background positions here
          
          */
          }
        }else{
               
            if(ent.dynamiccomponent.name == "Prop" && ent.dynamiccomponent.name == "prop"){
              ent.animationcontroller.PlayAnim('PropAnim', false, 'PropAnim');
              ent.animationcontroller.EnableAnimation('PropAnim');
              var tm = ent.placeable.transform;
              tm.pos.x = -64.83;
              tm.pos.y = 8.07;
              tm.pos.z = -79.25; 
              ent.placeable.transform = tm;
              
            }else if(ent.dynamiccomponent.name == "Scene" && ent.dynamiccomponent.name == "scene"){
              ent.animationcontroller.PlayAnim('SceneAnim', false, 'SceneAnim');
              ent.animationcontroller.EnableAnimation('SceneAnim');
              var tm = ent.placeable.transform;
              tm.pos.x = -58.98;
              tm.pos.y = 8.25;
              tm.pos.z = -73.77; 
              ent.placeable.transform = tm;
            }
       }
     }
		
	}	
			   //print('text doesnt exist.', text, tempArray[i]);
		 
 }
  
  
}// end of function


function RemoveAllEntities(){
  var ents = scene.GetEntitiesWithComponent('EC_DynamicComponent');
  for (i = 0; i<ents.length; i++)
  {
    scene.RemoveEntity(ents[i].Id()); 
  }
  
  console.LogInfo("Executing the funtion of removing all entities")
}


// destory the widget and stop the script running
function OnScriptdestroyed() {
	_widget.deleteLater();
	delete _widget ;
}

// start the script before checking the server whether it is running
//Running on server side
if (server.IsRunning()){
  console.LogInfo("server is running");
}
else{
    
   Init();
   print('Init');
}
