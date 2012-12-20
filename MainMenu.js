//!ref: Scripts/MainMenu.ui
//!ref: Scripts/Background.ui
//!ref: Scripts/Effect.ui
//!ref: ScriptS/Element.ui
//!ref: Scripts/ManMade.ui
//!ref: Scripts/Object.ui
//!ref: Scripts/Prop.ui
//!ref: Scripts/PropType.ui
//!ref: Scripts/Scene.ui
//!ref: Scripts/MumbleClientWidget.ui
//!ref: Scripts/MumbleConnectWidget.ui
//!ref: Scripts/StartMumble.ui


engine.IncludeFile("local://MumbleFunc.js");
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
var BackgroundList_visible = false;
var PropType_visible = false;

var ElementList_visible = false;
var ObjectList_visible = false;
var EffectList_visible = false;
var ManMadeList_visible = false;

var CurrentClickedItemName = null;

var PropTypeProxy = null;
var SceneProxy = null;
var BackgroundProxy = null;
var ElementProxy = null;
var ObjectProxy = null;
var ManMadeProxy = null;
var EffectProxy = null;
var MumbleClientProxy_visible = false;
var MumbleConnectProxy_visible = false;
var MumbleProxy = null;
var MumbleClientProxy = null;
var MumbleConnectProxy = null;
var _mumbleClientWidget = null;
var _mumbleConnectWidget = null;
var _SceneListWidget = null;
//var _PropListWidget = null;
var _BackgroundListWidget  = null;
var _ElementListWidget = null;
var _ObjectListWidget = null;
var _ManMadeListWidget = null;
var _EffectListWidget = null;

//------------mumble /variable----begin-------------//
var _connectionInfo =
{
    host      : "athena.mumble-serveur.com",    // Change to IP if you want to test remote Murmur servers.
    port      : 13501,          // Default port for Murmur, see murmur.ini for changing this.
    password  : "e92ds6gs",             // Default password for Murmur is empty, see murmur.ini for changing this.
    channel   : "mumble-serveur.com public #1",             // Default Murmur server will have one channel called "Root". Empty channel name is depicted as "Root" when connecting via MumblePlugin.
    outputMuted : false,        // True means your voice is sent after connecting, false means your output is muted.
    intputMuted : false         // True means voice should be sent to us from other client after connecting, false means server wont send us the voice packets.
};



//------------mumble /variable ----- end ------------//

/*
Use these to get added properties into right positions. Divided into 3 groups.
*/
//TOADD lajittele aakkosittain
var Scenes = ["Winter", "Mountains", "Medow", "Forest", "City", "Beach", "Room"];
var Backgrounds = ["NightSky", "DaySky", "Sunset"];
var Elements =["Clouds", "Sun", "Moon", "SnowFlakes","Rain" ,"Volcano"];
var Objects = ["Palm", "Tree", "Butterflies", "Mushroom", "Walrus", "PinkElephant"];
var ManMade = ["Rocket", "SandToys", "Tombstone", "Car", "Treasure", "Mob", "Parasol", "Pirates"];
var SpecialEffects = ["Monolith", "UFO", "Fire", "Hearts", "Rain", "SnowFlakes"];

var PropType = ["Element","Object","ManMade","Effect"];


var ScenePos = [
position1 = {x : -53.98, y: 10.25, z: -73.77},
position2 =  {x : -60.98, y: 7.75, z: -73.77}
];

var SkyPropPos = [
Skyposition1 = {x: -57.33, y: 16.57, z: -79.25},
Skyposition2 = {x: -53.33, y: 17.07, z: -67.75}
];

var GroundPropPos = [
  Groundposition1 = {x: -61.72, y:9.60, z:-67.75},
  //Groundposition2 = {x: ,y: ,z: }

];

var BackgPos = [
position1 = {x:-52.40 ,y:13.29 ,z:-73.83}
];

this.Positions = [ScenePos, GroundPropPos, SkyPropPos, BackgPos];



function Init()
{

//	---------------------------- Hook to MumblePlugin  / start ---------------------------------//
	 
		mumble.Connected.connect(OnConnected);
		mumble.Disconnected.connect(OnDisconnected);
		mumble.ConnectionRejected.connect(OnRejected);
	
		mumble.MeCreated.connect(OnMeCreated);
		mumble.JoinedChannel.connect(OnJoinedChannel);
	
		mumble.UserMuted.connect(OnUserLocalMuteChanged);
		mumble.UserSelfMuted.connect(OnUserSelfMutedChange);
		mumble.UserSelfDeaf.connect(OnUserSelfDeafChange);
		mumble.UserSpeaking.connect(OnUserSpeakingChange);
		mumble.UserPositionalChanged.connect(OnUserPositionalChange);
		mumble.ChannelTextMessageReceived.connect(OnChannelTextMessageReceived);
		
//	---------------------------- Hook to MumblePlugin  / end ---------------------------------//

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
	
	var _RandomBtn = findChild(_widget,"RandomBtn");
	_RandomBtn.pressed.connect(RandomButtonClicked);    //TODO  the function Random()

	//Add connects to elements, man made, special effectts and object buttons. 

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



// load the file "PropType.ui"
	var _PropTypeWidget = ui.LoadFromFile("Scripts/PropType.ui", false);
// TODO check the ElementBtnClicked() wehther we can take param in () or not, if it can, then we can use variable(var) replace concrete button name, e.g. varBtnClicked
// in that case, we just need only one function to deal with the event of button clicked.
	_ElementBtn = findChild(_PropTypeWidget,"ElementBtn");     
	_ElementBtn.pressed.connect(ElementBtnClicked); 			// listen to the event of Element button clicked in PropTypeWidget
	
	_ObjectBtn = findChild(_PropTypeWidget,"ObjectBtn");
	_ObjectBtn.pressed.connect(ObjectBtnClicked);				// listen to the event of Object button clicked in PropTypeWidget
	
	_ManMadeBtn = findChild(_PropTypeWidget,"ManMadeBtn");
	_ManMadeBtn.pressed.connect(ManMadeBtnClicked);				// listen to the event of ManMade button clicked in PropTypeWidget
	
	_EffectBtn = findChild(_PropTypeWidget,"EffectBtn");
	_EffectBtn.pressed.connect(EffectBtnClicked);				// listen to the event of Effect button clicked in PropTypeWidget
	           

	PropTypeProxy = new UiProxyWidget(_PropTypeWidget);

	ui.AddProxyWidgetToScene(PropTypeProxy);
	PropTypeProxy.visible = PropType_visible;
	PropTypeProxy.windowFlags = 0;
    
    PropTypeProxy.x = 965;             // they should be caculated late
    PropTypeProxy.y = 25;


// load the file "Element.ui"
	var _ElementWidget = ui.LoadFromFile("Scripts/Element.ui", false);

	_ElementListWidget = findChild(_ElementWidget,"ElementListWidget");
	_ElementListWidget.itemDoubleClicked.connect(ElementListItemDoubleClicked);           // listen to the event of item double clicked in ElementListWidget

	ElementProxy = new UiProxyWidget(_ElementWidget);

	ui.AddProxyWidgetToScene(ElementProxy);
	ElementProxy.visible = ElementList_visible;
	ElementProxy.windowFlags = 0;
    
    ElementProxy.x = 965 + 105;             // they should be caculated late
    ElementProxy.y = 25 + 13;

// load the file "Object.ui"
	var _ObjectWidget = ui.LoadFromFile("Scripts/Object.ui", false);

	_ObjectListWidget = findChild(_ObjectWidget,"ObjectListWidget");
	_ObjectListWidget.itemDoubleClicked.connect(ObjectListItemDoubleClicked);           // listen to the event of item double clicked in ObjectListWidget

	ObjectProxy = new UiProxyWidget(_ObjectWidget);

	ui.AddProxyWidgetToScene(ObjectProxy);
	ObjectProxy.visible = ObjectList_visible;
	ObjectProxy.windowFlags = 0;
    
    ObjectProxy.x = 965 + 105;             // they should be caculated late
    ObjectProxy.y = 25 + 13 ;

// load the file "ManMade.ui"
	var _ManMadeWidget = ui.LoadFromFile("Scripts/ManMade.ui", false);

	_ManMadeListWidget = findChild(_ManMadeWidget,"ManMadeListWidget");
	_ManMadeListWidget.itemDoubleClicked.connect(ManMadeListItemDoubleClicked);           // listen to the event of item double clicked in ManMadeListWidget

	ManMadeProxy = new UiProxyWidget(_ManMadeWidget);

	ui.AddProxyWidgetToScene(ManMadeProxy);
	ManMadeProxy.visible = ManMadeList_visible;
	ManMadeProxy.windowFlags = 0;
    
    ManMadeProxy.x = 965 + 105;             // they should be caculated late
    ManMadeProxy.y = 25 + 13 ;

// load the file "Effect.ui"
	var _EffectWidget = ui.LoadFromFile("Scripts/Effect.ui", false);

	_EffectListWidget = findChild(_EffectWidget,"EffectListWidget");
	_EffectListWidget.itemDoubleClicked.connect(EffectListItemDoubleClicked);           // listen to the event of item double clicked in EffectListWidget

	EffectProxy = new UiProxyWidget(_EffectWidget);

	ui.AddProxyWidgetToScene(EffectProxy);
	EffectProxy.visible = EffectList_visible;
	EffectProxy.windowFlags = 0;
    
    EffectProxy.x = 965 + 105;             // they should be caculated late
    EffectProxy.y = 25 + 13 ;

// --------------------------------------------------- mumble /widget---- --- begin ------------------------------------------//
// load the file "StartMumble.ui and add it into the scene"
	var _mumbleWidget = ui.LoadFromFile("Scripts/StartMumble.ui",false);
	var _MumbleBtn = findChild(_mumbleWidget,"MumbleBtn");
//	 when the mumble button clicked, the mumble client GUI will be shown in the scene
	_MumbleBtn.pressed.connect(MumbleBtnClicked);
	
	var MumbleProxy = new UiProxyWidget(_mumbleWidget);
	ui.AddProxyWidgetToScene(MumbleProxy);
//	 set the default value of visible as  true;
	MumbleProxy.visible = true;
	MumbleProxy.windowFlags = 0;
	MumbleProxy.x = 1;
	MumbleProxy.y = 0;


	
	_mumbleClientWidget = ui.LoadFromFile("Scripts/MumbleClientWidget.ui",false);
	MumbleClientProxy = new UiProxyWidget(_mumbleClientWidget);
	
	
		_buttonConnect = findChild(_mumbleClientWidget,"buttonOpenConnect");
		_buttonConnect.clicked.connect(ShowConnectDialog);
	
	    _buttonDisconnect = findChild(_mumbleClientWidget, "buttonDisconnect");
		_buttonDisconnect.clicked.connect(mumble, mumble.Disconnect); // Direct connection to MumblePlugin C++ QObject
	
		_buttonWizard = findChild(_mumbleClientWidget, "buttonOpenWizard");
		_buttonWizard.clicked.connect(mumble, mumble.RunAudioWizard); // Direct connection to MumblePlugin C++ QObject
	
		_buttonSelfMute = findChild(_mumbleClientWidget, "muteSelfToggle");
		_buttonSelfMute.clicked.connect(OnSelfMuteToggle);
	
		_buttonSelfDeaf = findChild(_mumbleClientWidget, "deafSelfToggle");
		_buttonSelfDeaf.clicked.connect(OnSelfDeafToggle);
		
		_userList = findChild(_mumbleClientWidget, "listUsers");
	
	ui.AddProxyWidgetToScene(MumbleClientProxy);
	MumbleClientProxy.visible = MumbleClientProxy_visible;
	MumbleClientProxy.windowFlags = 0;
	MumbleClientProxy.x = 2;
	MumbleClientProxy.y = 42;
	
	
	
//------------------------------------------------- mumble /widget-------------end ------------------------------//
	

}

	// when scene button and background button are clicked, then it should hide all sub menus of proptype
   /* function clearPropTypeMenu(){
		for(var i= 0; i<PropType.length; i++){
			var tempString = (UiProxyWidget) (PropType[i] + "Proxy");
			tempString.visible = false;
		}
		
	}*/
	
	function clearPropTypeMenu(){
		ElementProxy.visible = false;
		ObjectProxy.visible = false;
		ManMadeProxy.visible = false;
		EffectProxy.visible = false;
		
	}
	// when one of proptype menus clicked, others should be hidden. 
	/*function clearPropTypeSubMenu(btnName){
		for(var i=0; i<PropType.length; i++){
			if(PropType[i] != btnName)
			{
				var tempString = UiProxyWidget(PropType[i] + "Proxy");
				tempString.visible = false; 
			}
			else{
				var tempS = (UiProxyWidget)(PropType[i] + "Proxy");
				tempS.visible = true;
			}
		}
	
	}*/
	function clearPropTypeSubMenu(btnName){
		if(btnName == "Element"){
			ElementProxy.visible = true;
			ObjectProxy.visible = false;
			ManMadeProxy.visible = false;
			EffectProxy.visible = false;
		}else if (btnName == "Object"){
			ElementProxy.visible = false;
			ObjectProxy.visible = true;
			ManMadeProxy.visible = false;
			EffectProxy.visible = false;
		}else if (btnName == "ManMade"){
			ElementProxy.visible = false;
			ObjectProxy.visible = false;
			ManMadeProxy.visible = true;
			EffectProxy.visible = false;
		}else if(btnName == "Effect"){
			ElementProxy.visible = false;
			ObjectProxy.visible = false;
			ManMadeProxy.visible = false;
			EffectProxy.visible = true;
		}
		
	}


//---------------------------
	function MumbleBtnClicked(){
		// show and hide the mumble of client
		MumbleClientProxy_visible = !MumbleClientProxy_visible;
		MumbleClientProxy.visible = MumbleClientProxy_visible;
		 SetConnectionState(false, "Disconnected");
		// hide the connect dialog
		MumbleConnectProxy.visible = false;
		
	}

//----------------------------
/*
 *  handle the mouse event occur on submenu (scene, prop, background, clear).
 *  currently, just implement the effect that click the button once , the submenu will be shown, click the button again, the submenu disappear, do the loop like that 
 */
 
	function SceneBtnClicked(){
      _SceneListWidget.clear();
      for(i = 0; i < Scenes.length; i++){
        _SceneListWidget.addItem(Scenes[i]);
      }
	  SceneProxy.visible = true;
	  PropTypeProxy.visible = ! SceneProxy.visible;
	  clearPropTypeMenu();
	  BackgroundProxy.visible = ! SceneProxy.visible;
	}
	
	function PropBtnClicked(){
	  PropTypeProxy.visible= true;
	  SceneProxy.visible = ! PropTypeProxy.visible;
	  BackgroundProxy.visible = ! PropTypeProxy.visible;
	}

    function ElementBtnClicked(){
	  _ElementListWidget.clear();
      for(i = 0; i < Elements.length; i++){
        _ElementListWidget.addItem(Elements[i]);
      }
	  ElementProxy.visible = true;
	  SceneProxy.visible = ! ElementProxy.visible;
	  BackgroundProxy.visible = ! ElementProxy.visible;
	  clearPropTypeSubMenu("Element");
	}
	
	function ObjectBtnClicked(){
	  _ObjectListWidget.clear();
      for(i = 0; i < Objects.length; i++){
        _ObjectListWidget.addItem(Objects[i]);
      }
	  ObjectProxy.visible = true;
	  SceneProxy.visible = ! ObjectProxy.visible;
	  BackgroundProxy.visible = ! ObjectProxy.visible;
	  clearPropTypeSubMenu("Object");
	}
	
	function ManMadeBtnClicked(){
	  _ManMadeListWidget.clear();
      for(i = 0; i < ManMade.length; i++){
        _ManMadeListWidget.addItem(ManMade[i]);
      }
	  ManMadeProxy.visible = true;
	  SceneProxy.visible = ! ManMadeProxy.visible;
	  BackgroundProxy.visible = ! ManMadeProxy.visible;
	  clearPropTypeSubMenu("ManMade");
	}
	
	function EffectBtnClicked(){
	  _EffectListWidget.clear();
      for(i = 0; i < SpecialEffects.length; i++){
        _EffectListWidget.addItem(SpecialEffects[i]);
      }
	  EffectProxy.visible = true;
	  SceneProxy.visible = ! EffectProxy.visible;
	  BackgroundProxy.visible = ! EffectProxy.visible;
	  clearPropTypeSubMenu("Effect");
	}
	
	function BackgroundBtnClicked(){
      console.LogInfo(_BackgroundListWidget);
	  _BackgroundListWidget.clear();
	  for(i = 0; i < Backgrounds.length; i++){
      _BackgroundListWidget.addItem(Backgrounds[i]);
	  }
	  BackgroundProxy.visible  = true;
	  SceneProxy.visible = ! BackgroundProxy.visible;
 	  PropTypeProxy.visible = ! BackgroundProxy.visible;
	  clearPropTypeMenu();
	}

	function ClearMenuBtnClicked(){

		SceneProxy.visible = false;
		PropTypeProxy.visible = false;
		BackgroundProxy.visible = false;
		clearPropTypeMenu();
	}
	
	function RandomButtonClicked(){
    RemoveAllEntities();
		var ElementArray = [Backgrounds, Scenes];
		var randomProp = [Elements, Objects, ManMade, SpecialEffects];
		var idx = rnd(randomProp.length);
		var entidx = rnd(randomProp[idx].length);
		var ent = randomProp[idx][entidx];
		//var ent = rndtype [entidx];
		LoadXML(ent);
		
		var idx = rnd(ElementArray[0].length);
		var ent = ElementArray[0][idx];
    LoadXML(ent);
    
    var idx = rnd(ElementArray[1].length);
    var ent = ElementArray[1][idx];
    LoadXML(ent);
    
    
	}
 	





/* 
 * handle the mouse event occur on the submenu
 *
 */
 // how to get the object name from the ListWidget, actully, Object name = ListWidget.item[index].text()    Is this syntax right?
	// 	how to get the number of index
  

 	function SceneListItemDoubleClicked(){
		var type ='Scene';
		CurrentClickedItemName = _SceneListWidget.currentItem().text();
		console.LogInfo(_SceneListWidget.objectName);
		console.LogInfo("CurrentClicked        SceceListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName, type);
	}
	
	function BackgroundListItemDoubleClicked (){
		CurrentClickedItemName = _BackgroundListWidget.currentItem().text();
		console.LogInfo(_BackgroundListWidget.objectName);
		console.LogInfo("CurrentClicked        BackgroundListItem: " + CurrentClickedItemName);
		var ents = scene.GetEntitiesWithComponent('EC_DynamicComponent');
		for(i in ents){
      if(ents[i].dynamiccomponent.name == 'background' || ents[i].dynamiccomponent.name == 'Background')
        scene.RemoveEntity(ents[i].id);
		}
		LoadXML(CurrentClickedItemName);
	}
   /*
  //Replace with ElementlistDoubleClicked()
	function PropListItemDoubleClicked (){
		CurrentClickedItemName = _PropListWidget.currentItem().text();
		console.LogInfo(_PropListWidget.objectName);
		console.LogInfo("CurrentClicked        PropListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}
	*/
	function ElementListItemDoubleClicked () {
		CurrentClickedItemName = _ElementListWidget.currentItem().text();
		console.LogInfo(_ElementListWidget.objectName);
		console.LogInfo("CurrentClicked        ElementListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}
	
	function ObjectListItemDoubleClicked () {
		CurrentClickedItemName = _ObjectListWidget.currentItem().text();
		console.LogInfo(_ObjectListWidget.objectName);
		console.LogInfo("CurrentClicked        ObjectListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}

	function ManMadeListItemDoubleClicked () {
		CurrentClickedItemName = _ManMadeListWidget.currentItem().text();
		console.LogInfo(_ManMadeListWidget.objectName);
		console.LogInfo("CurrentClicked        ManMadeListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);	
	}
	
	function EffectListItemDoubleClicked () {
		CurrentClickedItemName = _EffectListWidget.currentItem().text();
		console.LogInfo(_EffectListWidget.objectName);
		console.LogInfo("CurrentClicked        EffectListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}	


	

/*
This function is launched if the new added entity has an animationcontroller. If the entity has no animations, we wait and let tundra load them.
After that we launch EnableAnims, which activates animations.
*/
function CheckAnims(enti){
  var ent = scene.GetEntityByName(enti);
  this.enti=ent;
  if(ent.animationcontroller.GetAvailableAnimations().length > 0){
     EnableAnims();
  }else
    frame.DelayedExecute(1.0).Triggered.connect(EnableAnims);
}

/*
Animations have to be named 'SceneAnim' or 'PropAnim'. 
This function is launched when animations have been loaded into the entity and they are usable.
In this.Positions array 0 = Scene Placement, 1 = Prop Placement and 2 = Background placement
*/


function rnd(n){
  seed = new Date().getTime();
  seed = (seed*9301+49297) % 233280;
  return (Math.floor((seed/(233280.0)* n)));
}

function NarratorAnim(){
  /*
  Function for randoming narrators animations
  */
  var nar = scene.GetEntityByName('narrator');
  var a = nar.animationcontroller.GetAvailableAnimations();
    
  if(a.length < 0)
    console.LogInfo('No animations yet');
  else{
    var idx = rnd(a.length);
    nar.animationcontroller.EnableAnimation(a[idx], false);
  }
  
}

function LoadXML (text){
  NarratorAnim();
  /*
  effectArray holds all possible props, scenes or backgrounds that can be added into the 3d world with GUI. The name in array has to be exact same as 
  the name of the file in /Props/ folder. variable text is GUI's text of chosen button and is used to compare. Use the table made my Tomi & Paula to get
  right names for effectArray.
  */			   
  
  if(text == null || text == ""){
	  console.LogInfo("You havn't selected any effect");
  }
  else
  {
  
    //Load entity from file, inside Props folder. assets[0] is entity, so scene.LoadSceneXML returns array.
    //Create a dynamiccomponent for the entity to check if it has been placed into the world already. This way we wont place them again when adding an new entity.
    var assets = scene.LoadSceneXML(asset.GetAsset(text + ".txml").DiskSource(), false, false, 0);
    var enti = assets[0].name;
    var id = assets[0].id;
    var ent = scene.GetEntityByName(enti);
    ent.placeable.visible = false;
    ent.dynamiccomponent.CreateAttribute('bool', 'Placed');
    
    if(!ent.animationcontroller && ent.dynamiccomponent.GetAttribute('Placed') == false)
      CheckPlacement(enti);
    else if(ent.dynamiccomponent.GetAttribute('Placed') == false)
      CheckAnims(enti);
    else
      console.LogInfo('We have a bug at loadXML');
   }
}



function CheckPlacement(enti){
			  //CASE1: Entity has no animations and is not placed yet. We place it and set placed to true, depending on if its prop, scene or background. 
			  //TODO: An array for multiple different locations that the entity can be added in.
          var ent = scene.GetEntityByName(enti);
          if(ent.dynamiccomponent.name == "Prop" || ent.dynamiccomponent.name == "prop"){
              
             /*var tm = ent.placeable.transform;
             tm.pos.x = pos.x;
             tm.pos.y = pos.y;
             tm.pos.z = pos.z;
             ent.placeable.transform = tm;*/ 
             ent.placeable.visible = true;            
             ent.dynamiccomponent.SetAttribute('Placed', true);
             
          }else if (ent.dynamiccomponent.name == "Scene" || ent.dynamiccomponent.name == "scene"){
             var idx = rnd(this.Positions[0].length);
             var pos = this.Positions[0][idx];
             /*var tm = ent.placeable.transform;
             tm.pos.x = pos.x;
             tm.pos.y = pos.y;
             tm.pos.z = pos.z;
             ent.placeable.transform = tm;*/
             ent.placeable.visible = true;  
             ent.dynamiccomponent.SetAttribute('Placed', true);
             
          }else if(ent.dynamiccomponent.name == "Background" || ent.dynamiccomponent.name == "background"){
             var idx = rnd(this.Positions[3].length);
             var pos = this.Positions[3][idx];
             /*var tm = ent.placeable.transform;
             tm.pos.x = pos.x;
             tm.pos.y = pos.y;
             tm.pos.z = pos.z;
             tm.rot.y = 180;
             ent.placeable.transform = tm;*/  
             ent.placeable.visible = true;
             ent.dynamiccomponent.SetAttribute('Placed', true);
          }
            
}

function EnableAnims(){
    var ent = this.enti;
    if(ent.dynamiccomponent.name == "Prop" || ent.dynamiccomponent.name == "prop"){
      
      /*var tm = ent[i].placeable.transform;
      tm.pos.x = pos.x;
      tm.pos.y = pos.y;
      tm.pos.z = pos.z;
      ent[i].placeable.transform = tm;*/
      
      ent.animationcontroller.EnableAnimation('PropAnim'); 
      ent.placeable.visible = true;
      ent.dynamiccomponent.SetAttribute('Placed', true);
      
    }else if(ent.dynamiccomponent.name == "Scene" || ent.dynamiccomponent.name == "scene"){
    
      var idx = rnd(this.Positions[0].length);
      var pos = this.Positions[0][idx]; 
      
      /*var tm = ent[i].placeable.transform;
      tm.pos.x = pos.x;
      tm.pos.y = pos.y;
      tm.pos.z = pos.z; 
      ent[i].placeable.transform = tm;*/

      ent.animationcontroller.EnableAnimation('SceneAnim');
      
      ent.placeable.visible = true;
      ent.dynamiccomponent.SetAttribute('Placed', true);
      
    }else if(ent.dynamiccomponent.name == "Background" || ent.dynamiccomponent.name == "background"){
    
      var pos = this.Positions[3][0];
      /*var tm = ent[i].placeable.transform;
      tm.pos.x = pos.x;
      tm.pos.y = pos.y;
      tm.pos.z = pos.z;
      ent[i].placeable.transform = tm;*/
      ent.placeable.visible = true;
      ent.dynamiccomponent.SetAttribute('Placed', true);
      
    }
     
}

			   //print('text doesnt exist.', text, tempArray[i]);

 
  
  
// end of function

/*
Removes all entities that have DynamicComponent, in our case they are user assigned entities.
*/
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
	tundra.ForgetAllAssets();
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