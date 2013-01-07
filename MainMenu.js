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

/*  Authors: Xiaori Hu & Lasse Annola
 *	MainMenu includes the submenus(background, proptype, scene, clearMenu, clearEntity) , besides, the prop also has four submenus (element, object, manmade, effect)
 *  itself.
 *  When you click the buttons ( background, proptype, scene) on the interface of MainMenu, it will popup the corresponding submenu at right side of MainMenu
 *  when you click the button (clearMenu) on the interface of MainMenu, it will hind the submenu in the screen
 *  when you click the button (clearEntity) on the interface of MainMenu, it will clear all the entities in the scene. 
 *  KNOWN BUG: When holding z,x,c or space for a long period of time to move an entity GUI crashes. Fixed by adding MainMenu.js gui script into a separate entity
 *    from PropsScript.js.
 */

// global variables
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
    port      : 13501,          				// Default port for Murmur, see murmur.ini for changing this.
    password  : "e92ds6gs",             		// Default password for Murmur is empty, see murmur.ini for changing this.
    channel   : "mumble-serveur.com public #1", // Default Murmur server will have one channel called "Root". Empty channel name is depicted as "Root" when connecting via MumblePlugin.
    outputMuted : false,        // True means your voice is sent after connecting, false means your output is muted.
    intputMuted : false         // True means voice should be sent to us from other client after connecting, false means server wont send us the voice packets.
};
//------------mumble /variable ----- end ------------//

/*
These are all Properties that are currently made for our Project, if you make a new entity add its files to scenes rootfolder and according to
its name in root add it to array. For example if you have City.txml in your root you must have 'City' in array. Case sensitive!!!
*/
var Scenes = ["Winter", "Mountains", "Medow", "Forest", "City", "Beach", "Room"].sort();
var Backgrounds = ["NightSky", "DaySky", "Sunset"].sort();
var Elements =["Clouds", "Sun", "Moon", "SnowFlakes","Rain" ,"Volcano", "Fire", "Rainbow"].sort();
var Objects = ["Palm", "Tree", "Butterflies", "Mushroom", "Walrus", "PinkElephant", "Bunny", "Cow"].sort();
var ManMade = ["Axe", "Cottage", "Rocket", "SandToys", "Tombstone", "Car", "Treasure", "Mob", "Parasol", "Pirates", "SandCastle", "Snowman"].sort();
var SpecialEffects = ["Monolith", "UFO", "Fire", "Hearts", "Rain", "SnowFlakes", "Fireworks"].sort();

var PropType = ["Element","Object","ManMade","Effect"];

/*
These arrays are for different kind of entities, if the positions of those when adding them would be 
  determined from script.
*/
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


/*
 * Initialization for mainmenu and mumble. For the mainmenu, it should load all widgets related to mainmenu, add all event listeners.
 * For the mumble, it also should load all widgets related to mumble and add all corresponding event listerners. Besides, since we use 
 * the mumble plugin in our project,  in order to realize the mumble function, it requires install a client-side mumble(can be downloaded 
 * from the official website of Mumble) before running this script.
 */
function Init()
{

// -------------Hook to MumblePlugin  ------------- begin ---------- //
	 
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
// -------------- Hook to MumblePlugin ---------------end -----------------//

		
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
	_ClearEntityBtn.pressed.connect(RemoveAllEntities);		    // listering to the singal of clean entity button clicked
	
	var _RandomBtn = findChild(_widget,"RandomBtn");
	_RandomBtn.pressed.connect(RandomButtonClicked);    		// listering to the singal of random button clicked, which will generate effect randomly.

 	var MenuProxy = new UiProxyWidget(_widget);
 
 	ui.AddProxyWidgetToScene(MenuProxy);
    MenuProxy.visible = true;
    MenuProxy.windowFlags = 0;
	
	//set proxy position
	MenuProxy.x = 860;
	MenuProxy.y = 25;

// load the file "Scene.ui"	 
	var _SceneWidget = ui.LoadFromFile("Scripts/Scene.ui", false);

    _SceneListWidget = findChild(_SceneWidget, "SceneListWidget");
	_SceneListWidget.itemDoubleClicked.connect(SceneListItemDoubleClicked); //  listen to the event of item double clicked in the SceneListWidget

    SceneProxy = new UiProxyWidget(_SceneWidget);
    
    ui.AddProxyWidgetToScene(SceneProxy);
    SceneProxy.visible = SceneList_visible;   
    SceneProxy.windowFlags = 0;				 
	
    // set proxy position 
    SceneProxy.x = 965;             
    SceneProxy.y = 25;

// load the file "Background.ui" 
	var _BackgroundWidget = ui.LoadFromFile("Scripts/Background.ui", false);

	_BackgroundListWidget = findChild(_BackgroundWidget,"BackgroundListWidget");
	_BackgroundListWidget.itemDoubleClicked.connect(BackgroundListItemDoubleClicked);   // listen to the event of item double clicked in the BackgroundListWidget

	BackgroundProxy = new UiProxyWidget(_BackgroundWidget);

	ui.AddProxyWidgetToScene(BackgroundProxy);
	BackgroundProxy.visible = BackgroundList_visible;
	BackgroundProxy.windowFlags = 0;
    
	//set proxy position
    BackgroundProxy.x = 965;            
    BackgroundProxy.y = 25;



// load the file "PropType.ui", note that, the PropType includes four submenus: element, object, manmade, specialeffect
	var _PropTypeWidget = ui.LoadFromFile("Scripts/PropType.ui", false);
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
    
	//set proxy position
    PropTypeProxy.x = 965;           
    PropTypeProxy.y = 25;


// load the file "Element.ui"
	var _ElementWidget = ui.LoadFromFile("Scripts/Element.ui", false);

	_ElementListWidget = findChild(_ElementWidget,"ElementListWidget");
	_ElementListWidget.itemDoubleClicked.connect(ElementListItemDoubleClicked);           // listen to the event of item double clicked in ElementListWidget

	ElementProxy = new UiProxyWidget(_ElementWidget);

	ui.AddProxyWidgetToScene(ElementProxy);
	ElementProxy.visible = ElementList_visible;
	ElementProxy.windowFlags = 0;
    
	//set proxy position
    ElementProxy.x = 965 + 105;            
    ElementProxy.y = 25 + 13;

// load the file "Object.ui"
	var _ObjectWidget = ui.LoadFromFile("Scripts/Object.ui", false);

	_ObjectListWidget = findChild(_ObjectWidget,"ObjectListWidget");
	_ObjectListWidget.itemDoubleClicked.connect(ObjectListItemDoubleClicked);           // listen to the event of item double clicked in ObjectListWidget

	ObjectProxy = new UiProxyWidget(_ObjectWidget);

	ui.AddProxyWidgetToScene(ObjectProxy);
	ObjectProxy.visible = ObjectList_visible;
	ObjectProxy.windowFlags = 0;
    
	//set proxy position
    ObjectProxy.x = 965 + 105;           
    ObjectProxy.y = 25 + 13 ;

// load the file "ManMade.ui"
	var _ManMadeWidget = ui.LoadFromFile("Scripts/ManMade.ui", false);

	_ManMadeListWidget = findChild(_ManMadeWidget,"ManMadeListWidget");
	_ManMadeListWidget.itemDoubleClicked.connect(ManMadeListItemDoubleClicked);           // listen to the event of item double clicked in ManMadeListWidget

	ManMadeProxy = new UiProxyWidget(_ManMadeWidget);

	ui.AddProxyWidgetToScene(ManMadeProxy);
	ManMadeProxy.visible = ManMadeList_visible;
	ManMadeProxy.windowFlags = 0;
    
	//set proxy position
    ManMadeProxy.x = 965 + 105;             
    ManMadeProxy.y = 25 + 13 ;

// load the file "Effect.ui"
	var _EffectWidget = ui.LoadFromFile("Scripts/Effect.ui", false);

	_EffectListWidget = findChild(_EffectWidget,"EffectListWidget");
	_EffectListWidget.itemDoubleClicked.connect(EffectListItemDoubleClicked);           // listen to the event of item double clicked in EffectListWidget

	EffectProxy = new UiProxyWidget(_EffectWidget);

	ui.AddProxyWidgetToScene(EffectProxy);
	EffectProxy.visible = EffectList_visible;
	EffectProxy.windowFlags = 0;
    
	//set proxy position
    EffectProxy.x = 965 + 105;            
    EffectProxy.y = 25 + 13 ;

// --------------------------------------------------- mumble /widget---- --- begin ------------------------------------------//
// load the file "StartMumble.ui and add it into the scene"
	var _mumbleWidget = ui.LoadFromFile("Scripts/StartMumble.ui",false);
	var _MumbleBtn = findChild(_mumbleWidget,"MumbleBtn");

	_MumbleBtn.pressed.connect(MumbleBtnClicked);    //	 when the mumble button clicked, the mumble client GUI will be shown in the scene
	
	var MumbleProxy = new UiProxyWidget(_mumbleWidget);
	ui.AddProxyWidgetToScene(MumbleProxy);
	
//	 set the default value of visible as  true;
	MumbleProxy.visible = true;
	MumbleProxy.windowFlags = 0;
	
	//set proxy position
	MumbleProxy.x = 1;
	MumbleProxy.y = 0;


	// load the file "MumbleClientWidget.ui"
	_mumbleClientWidget = ui.LoadFromFile("Scripts/MumbleClientWidget.ui",false);
	MumbleClientProxy = new UiProxyWidget(_mumbleClientWidget);
	
	
		_buttonConnect = findChild(_mumbleClientWidget,"buttonOpenConnect");
		_buttonConnect.clicked.connect(ShowConnectDialog);                // listen to the event of show connect Dialog 
	
	    _buttonDisconnect = findChild(_mumbleClientWidget, "buttonDisconnect");
		_buttonDisconnect.clicked.connect(mumble, mumble.Disconnect);     // Direct connection to MumblePlugin C++ QObject
	
		_buttonWizard = findChild(_mumbleClientWidget, "buttonOpenWizard");
		_buttonWizard.clicked.connect(mumble, mumble.RunAudioWizard);      // Direct connection to MumblePlugin C++ QObject
	
		_buttonSelfMute = findChild(_mumbleClientWidget, "muteSelfToggle");
		_buttonSelfMute.clicked.connect(OnSelfMuteToggle);                // listen to the event of Mute self 
	
		_buttonSelfDeaf = findChild(_mumbleClientWidget, "deafSelfToggle");
		_buttonSelfDeaf.clicked.connect(OnSelfDeafToggle);                 // listen to the event of Deaf self
		
		_userList = findChild(_mumbleClientWidget, "listUsers");
	
	ui.AddProxyWidgetToScene(MumbleClientProxy);
	MumbleClientProxy.visible = MumbleClientProxy_visible;
	MumbleClientProxy.windowFlags = 0;
	
	//set proxy position
	MumbleClientProxy.x = 2;
	MumbleClientProxy.y = 42;
	
	
	
//------------------------------------------------- mumble /widget-------------end ------------------------------//


}

	// responed to the event of cleanPropTypeMenu, when the scene or background widget shown, it should call this function to hide the proptype widget and its four  
	// submenu widgets
	function clearPropTypeMenu(){
		ElementProxy.visible = false;
		ObjectProxy.visible = false;
		ManMadeProxy.visible = false;
		EffectProxy.visible = false;
		
	}
	// respond to the event of clearPropTypeSubMenu, e.g. it shows the proptype widget currently, when one of the four submenus selected, then the rest submenu widgets
	// should be hidden. 
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


//  respond to the event of Mumble button clicked, when the mumble button clicked, then it will show the mumble client widget in the scene. 
	function MumbleBtnClicked(){
		// show and hide the mumble of client
		MumbleClientProxy_visible = !MumbleClientProxy_visible;
		MumbleClientProxy.visible = MumbleClientProxy_visible;
		 SetConnectionState(false, "Disconnected");
		// hide the connect dialog
		MumbleConnectProxy.visible = false;
		
	}

/*
 *  handle all events occurring on submenus (background, proptype, scene, clearMenu, clearEntity)---------begin------------
 */
 
 	// when scene button clicked, it will load all items related to scene from the scene array, and hide the proptype and background widgets.
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
	
	// when proptype button clicked, it will show the proptype widget, and hide the proptype and background widgets.
	function PropBtnClicked(){
	  PropTypeProxy.visible= true;
	  SceneProxy.visible = ! PropTypeProxy.visible;
	  BackgroundProxy.visible = ! PropTypeProxy.visible;
	}
	
    // when element button clicked, it will load all items related to element from the element array, hide the proptype,background widgets and the rest submenu 
	// widgets(object, manmade, effect) in proptype. 
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
	
	// when object button clicked, it will load all items related to object from the object array, hide the proptype,background widgets and the rest submenu 
	// widgets(element, manmade, effect) in proptype.
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
	// when manmade button clicked, it will load all items related to manmade from the manmade array, hide the proptype,background widgets and the rest submenu 
	// widgets(element, object, effect) in proptype.
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
	
	// when effect button clicked, it will load all items related to effect from the specialeffect array, hide the proptype,background widgets and the rest submenu 
	// widgets(element, manmade, object) in proptype.
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
	
	// when background button clicked, it will load all items related to background from the background array, and hide the proptype and scene widgets.
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

	//respond to the event of clean menu
	function ClearMenuBtnClicked(){

		SceneProxy.visible = false;
		PropTypeProxy.visible = false;
		BackgroundProxy.visible = false;
		clearPropTypeMenu();
	}
	// respond to the event of Random generate the effect 
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
 	
//------------------------ handle all events occurring on submenus (background, proptype, scene, clearMenu, clearEntity)------------end-------//

/* 
 * --------------------handle all events occurring on the itemListWidget----------------------begin ----------------------//
 *
 */
	// respond to the event of item double clicked in the sceneListWidget
 	function SceneListItemDoubleClicked(){
    RemoveOld();
		var type ='Scene';
		CurrentClickedItemName = _SceneListWidget.currentItem().text();
		console.LogInfo(_SceneListWidget.objectName);
		console.LogInfo("CurrentClicked        SceceListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName, type);
	}
	
	// respond to the event of item double clicked in the backgroundListWidget
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
	
	// respond to the event of item double clicked in the effectListWidget
	function ElementListItemDoubleClicked () {
		CurrentClickedItemName = _ElementListWidget.currentItem().text();
		console.LogInfo(_ElementListWidget.objectName);
		console.LogInfo("CurrentClicked        ElementListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}
	
	// respond to the event of item double clicked in the objectListWidget
	function ObjectListItemDoubleClicked () {
		CurrentClickedItemName = _ObjectListWidget.currentItem().text();
		console.LogInfo(_ObjectListWidget.objectName);
		console.LogInfo("CurrentClicked        ObjectListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}

	// respond to the event of item double clicked in the manmadeListWidget
	function ManMadeListItemDoubleClicked () {
		CurrentClickedItemName = _ManMadeListWidget.currentItem().text();
		console.LogInfo(_ManMadeListWidget.objectName);
		console.LogInfo("CurrentClicked        ManMadeListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);	
	}
	
	// respond to the event of item double clicked in the effectListWidget
	function EffectListItemDoubleClicked () {
		CurrentClickedItemName = _EffectListWidget.currentItem().text();
		console.LogInfo(_EffectListWidget.objectName);
		console.LogInfo("CurrentClicked        EffectListItem: " + CurrentClickedItemName);
		LoadXML(CurrentClickedItemName);
	}	

//--------------------handle all events occurring on the itemListWidget----------------------end ----------------------//
	

/*
This function is launched if the new added entity has an animationcontroller. If the entity has no animations, we wait and let tundra load them.
After that we launch EnableAnims, which activates animations.
*/
function CheckAnims(enti){
  var ent = scene.GetEntity(enti);
  this.enti=ent;
  if(ent.animationcontroller.GetAvailableAnimations().length > 0){
     EnableAnims();
  }else
    frame.DelayedExecute(1.0).Triggered.connect(EnableAnims);
}

//A custom random function.
function rnd(n){
  seed = new Date().getTime();
  seed = (seed*9301+49297) % 233280;
  return (Math.floor((seed/(233280.0)* n)));
}

/*
Function for randoming narrators animations. Narrator entity has to be named 'narrator' in this case.
*/
function NarratorAnim(){
  var nar = scene.GetEntityByName('narrator');
  var a = nar.animationcontroller.GetAvailableAnimations();
    
  if(a.length < 0)
    console.LogInfo('No animations yet');
  else{
    var idx = rnd(a.length);
    nar.animationcontroller.EnableAnimation(a[idx], false);
  }
  
}
/*
Removes all highlights to be sure that entities are not selected when added to scene.
*/
function RemoveHighlights(ents){
  for (i in ents){
    ents[i].RemoveComponent('EC_Highlight', 'MySpecialHighlight');
  }

}

function LoadXML (text){
  
  /*
  This function loads the entity from file .txml and places it according to its own settings. All Props, Scenes and Backgrounds are in the root folder of Oulutest.
  Also on every new action with GUI, we make our "narrator" animate. See NarratorAnim() for its logic.
  */			   
  NarratorAnim();
  
  if(text == null || text == ""){
	  console.LogInfo("You havn't selected any effect");
  }
  else
  {
  
    //Load entity from file. assets[0] is entity, so scene.LoadSceneXML returns array.
    var assets = scene.LoadSceneXML(asset.GetAsset(text + ".txml").DiskSource(), false, false, 0);
    var enti = assets[0].name;
    var id = assets[0].id;
    var ent = scene.GetEntity(id);
    ent.placeable.visible = false;
    ent.dynamiccomponent.CreateAttribute('bool', 'Placed');
    
    //Check if entity has animationcontroller.
    if(!ent.animationcontroller && ent.dynamiccomponent.GetAttribute('Placed') == false)
      CheckPlacement(id);
    else if(ent.dynamiccomponent.GetAttribute('Placed') == false)
      CheckAnims(id);
    else if(ent.dynamiccomponent.GetAttribute('Placed') == true && !ent.animationcontroller)
      CheckPlacement(id);
    else if(ent.dynamiccomponent.GetAttribute('Placed') == true)
      CheckAnims(id);
    else
      console.LogInfo('Entity is missing dynamiccomponent.');
   }
}




function CheckPlacement(enti){
    //CASE1: Entity has no animations and is not placed yet. We place it and set placed to true, depending on if its prop, scene or background. 
      var ent = scene.GetEntity(enti);
      if(ent.dynamiccomponent.name == "Prop" || ent.dynamiccomponent.name == "prop"){
         ent.placeable.visible = true;            
         ent.dynamiccomponent.SetAttribute('Placed', true);
         
      }else if (ent.dynamiccomponent.name == "Scene" || ent.dynamiccomponent.name == "scene"){
         ent.placeable.visible = true;  
         ent.dynamiccomponent.SetAttribute('Placed', true);
         RemoveHighlights(scene.GetEntitiesWithComponent('EC_Highlight', 'MySpecialHighlight'));
         
      }else if(ent.dynamiccomponent.name == "Background" || ent.dynamiccomponent.name == "background"){
         ent.placeable.visible = true;
         ent.dynamiccomponent.SetAttribute('Placed', true);
      }
            
}

function EnableAnims(){
    //CASE2: Entity has animations, we check what kind of an entity it is and activate the animation
    //If entity is Prop it has PropAnim, this is decided to be the animation name of all props(they have only 1).
    //Scenes have SceneAnim named animation, same principle as in Props.
    var ent = this.enti;
    if(ent.dynamiccomponent.name == "Prop" || ent.dynamiccomponent.name == "prop"){     
      ent.animationcontroller.EnableAnimation('PropAnim'); 
      ent.placeable.visible = true;
      ent.dynamiccomponent.SetAttribute('Placed', true);
      
    }else if(ent.dynamiccomponent.name == "Scene" || ent.dynamiccomponent.name == "scene"){
      ent.animationcontroller.EnableAnimation('SceneAnim');      
      ent.placeable.visible = true;
      ent.dynamiccomponent.SetAttribute('Placed', true);
      
    }else if(ent.dynamiccomponent.name == "Background" || ent.dynamiccomponent.name == "background"){
      ent.placeable.visible = true;
      ent.dynamiccomponent.SetAttribute('Placed', true);
      
    }
     
}

/*
Removes all entities that have DynamicComponent, in our case they are user assigned entities.
*/
function RemoveAllEntities(){
  var ents = scene.GetEntitiesWithComponent('EC_DynamicComponent');
  for (i = 0; i<ents.length; i++)
  {
    scene.RemoveEntity(ents[i].Id()); 
  }
  
  console.LogInfo("Executing the function of removing all entities")
}

function RemoveOld(){
  var ents = scene.GetEntitiesWithComponent('EC_DynamicComponent');
  for (i = 0; i < ents.length; i++){
    if(ents[i].dynamiccomponent.name == 'scene' || ents[i].dynamiccomponent.name == 'Scene'){
      scene.RemoveEntity(ents[i].Id());
    }
  }
}
/*
Set Camera a new script which will set its position and inputmappers
*/
function SetCamera(){
  var cam = scene.GetEntityByName('FreeLookCamera');
  var script = cam.GetOrCreateComponent('EC_Script');
  script.scriptRef = ["local://freelookcamera.js", "local://CamScript.js"];
  
  
}

// Destory the widget and stop the script running
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
   //Call the camerasetting function
   SetCamera();
   print('Init');
}