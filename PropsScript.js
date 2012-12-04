// !_ref: http://source.com/mywidget.ui
engine.ImportExtension("qt.core");

var data_ =
{
    widget : null
};

var clicker =
{
    highlightName : "MySpecialHighlight",
    handleClick : function(ent, button, raycast)
    {
        //print("Entity clicked: " + ent);
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
            //Tänne remove inputs
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
    /*

    Props will be distinguished from background entities with an EC_Dynamiccomponent called Prop
    
    */
    HandleKeyPressed : function(e)
    {
        //First, movement to xyz coordinates.(Arrows, space and ctrl)
        if(e.keyCode == Qt.Key_Up){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.x = tm.pos.x + 0.5;
            ents[i].placeable.transform = tm;
              
          }
        }else if(e.keyCode == Qt.Key_Down){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.pos.x = tm.pos.x - 0.5;
              ents[i].placeable.transform = tm;
          }
        }else if(e.keyCode == Qt.Key_Right){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.z = tm.pos.z + 0.5;
            ents[i].placeable.transform = tm;
          }
        }else if(e.keyCode == Qt.Key_Left){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.z = tm.pos.z - 0.5;
            ents[i].placeable.transform = tm;
          }
        }else if(e.keyCode == Qt.Key_Space){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.y = tm.pos.y + 0.5;
            ents[i].placeable.transform = tm;
          }
        }else if(e.keyCode == Qt.Key_Control){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.pos.y = tm.pos.y - 0.5;
            ents[i].placeable.transform = tm;
          }
        //Add rotation.(Tab + CapsLock)
        }else if(e.keyCode == Qt.Key_Z){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
          for(var i=0; i<ents.length; i++){
            var tm = ents[i].placeable.transform;
            tm.rot.y = tm.rot.y + 0.5;
            ents[i].placeable.transform = tm;
          } 
        }else if(e.keyCode == Qt.Key_X){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.rot.y = tm.rot.y - 0.5;
              ents[i].placeable.transform = tm;
            }
        }else if(e.keyCode == Qt.Key_C){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.rot.x = tm.rot.x - 0.5;
              ents[i].placeable.transform = tm;
            }
        }else if(e.keyCode == Qt.Key_V){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
              var tm = ents[i].placeable.transform;
              tm.rot.x = tm.rot.x + 0.5;
              ents[i].placeable.transform = tm;
            }
          
        }else if(e.keyCode == Qt.Key_Delete){
          var ents = scene.GetEntitiesWithComponent('EC_Highlight', this.highlightName);
            for(var i=0; i<ents.length; i++){
                scene.RemoveEntity(ents[i].Id());
            } 
        }
    },
    checkInputs : function(ent)
    {
        if(!inputMapper){
          var inputMapper = input.RegisterInputContextRaw('RendererSettings', 90);
          inputMapper.KeyPressed.connect(this, this.HandleKeyPressed); 
          inputMapper.KeyDown.connect(this, this.HandleKeyPressed);
        }
    },   
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
    
    /*
    data_.widget = ui.LoadFromFile("http://source.com/mywidget.ui", false);
    data_.widget.myButton.clicked.connect(ButtonOrSomethingPressed);
    data_.widget.visible = true;
    */
}

function ButtonOrSomethingPressed()
{
    var selected = clicker.getSelectedEntities();
    if (selected.length == 0)
    {
        console.LogWarning("No selected entities");
        return;
    }
    
    for (i in selected){
      print (selected[i]);
    }
    
    clicker.removeHighlights(selected);
}

if (server.IsRunning())
    Start();
else
    Start();

function OnScriptDestroyed(){
  if(clicker != null ){
    //clicker.removeHighlights(clicker.getSelectedEntities());
    input.UnregisterInputContextRaw("RendererSettings");
    data_ = null;
    clicker = null;
  }

}