engine.ImportExtension("qt.core");
var counter = 0;
var data_ =
{
    widget : null
};
/*
 *  Author: Lasse Annola
 *  Clicker holds within all functions that determine when an entity is selected via mouseclick. Dynamiccomponent distinguishes user interact entities from background world.
 */
var clicker =
{
    highlightName : "MySpecialHighlight",
    handleClick : function(ent, button, raycast)
    {
        this.toggleHover(ent);
        
    },
    toggleHover : function(ent)
    {
        var h = ent.GetComponent("EC_Highlight", this.highlightName);
        if (h == null && ent.dynamiccomponent)
        {
            print("- Enabling selection");
            h = ent.CreateComponent("EC_Highlight", this.highlightName, 2, false);
            h.SetTemporary(true);
            h.visible = true;
            
        }
        else
        {
            print("- Disabling selection");
            ent.RemoveComponent("EC_Highlight", this.highlightName);
        }
    },
    removeHighlights : function(ents)
    {
        for(var i=0; i<ents.length; ++i)
            if (ents[i].GetComponent("EC_Highlight", this.highlightName) != null)
                this.toggleHover(ents[i]);
    },
    getSelectedEntities : function()
    {
        scene.GetEntitiesWithComponent("EC_Highlight", this.highlightName);
    },
    
    //Handling keypresses in Tundra
    HandleKeyPressed : function(e)
    {
      //Counter is made to keep cache buffers a bit lower, after 60looptimes it resets to 0 and empties cache.
      if(counter < 60){
        //First, movement to xyz coordinates.(Arrows, space and c)
        if(e.keyCode == Qt.Key_Up){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.x = tm.pos.x + 0.5;
            ents[i].placeable.transform = tm;
            counter += 1;
              
          }
        }else if(e.keyCode == Qt.Key_Down){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.pos.x = tm.pos.x - 0.5;
              ents[i].placeable.transform = tm;
              counter += 1;
          }
        }else if(e.keyCode == Qt.Key_Right){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.z = tm.pos.z + 0.5;
            ents[i].placeable.transform = tm;
            counter += 1;
          }
        }else if(e.keyCode == Qt.Key_Left){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.z = tm.pos.z - 0.5;
            ents[i].placeable.transform = tm;
            counter += 1;
          }
        }else if(e.keyCode == Qt.Key_Space){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.y = tm.pos.y + 0.5;
            ents[i].placeable.transform = tm;
            counter += 1;
          }
        }else if(e.keyCode == Qt.Key_C){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.y = tm.pos.y - 0.5;
            ents[i].placeable.transform = tm;
            counter += 1;
          }
        
        }else if(e.keyCode == Qt.Key_Z){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.rot.y = tm.rot.y + 0.5;
            ents[i].placeable.transform = tm;
            counter += 1;
          } 
        }else if(e.keyCode == Qt.Key_X){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.rot.y = tm.rot.y - 0.5;
              ents[i].placeable.transform = tm;
              counter += 1;
            }
        }else if(e.keyCode == Qt.Key_C){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.rot.x = tm.rot.x - 0.5;
              ents[i].placeable.transform = tm;
              counter += 1;
            }
        }else if(e.keyCode == Qt.Key_V){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.rot.x = tm.rot.x + 0.5;
              ents[i].placeable.transform = tm;
              counter += 1;
            }
          
        }else if(e.keyCode == Qt.Key_Delete){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
                scene.RemoveEntity(ents[i].Id());
            } 
        }
      }else
         counter = 0;
    },
    //Introducing of inputContextRaw and its usage. 
    checkInputs : function(ent)
    {
        if(!inputMapper){
          var inputMapper = input.RegisterInputContextRaw('RendererSettings', 90);
          inputMapper.SetTakeKeyboardEventsOverQt(true);
          inputMapper.KeyPressed.connect(this, this.HandleKeyPressed); 
          
        }
    },
    //Init function which connects to handleclick. 
    init: function(ent)
    {
        print("Initialized");
        sceneinteract.EntityClicked.connect(this, this.handleClick);
        this.checkInputs(ent);
        
       
    }
};


function Start(ent)
{  
    clicker.init(ent);
}


if (server.IsRunning())
    Start();
else
    Start();

function OnScriptDestroyed(){
  if(clicker != null ){
    input.UnregisterInputContextRaw("RendererSettings");
    data_ = null;
    clicker = null;
  }

}