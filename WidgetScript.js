//Basic function that makes this.me the entity holding this script
//Also creates a dynamiccomponent for dynamic checking and connects the Update function into frame.
function WidgetScript(entity, comp){
  this.me = entity;
  this.selected = false;
  
  var inputmapper = me.GetOrCreateComponent("EC_InputMapper");
  inputmapper.RegisterMapping("Ctrl+Tab", "ToggleCamera", 1);
  this.CreateHandlers();

}

WidgetScript.prototype.CreateHandlers = function(){
    var thingie =
{
    highlightName : "MySpecialHighlight",
    handleClick : function(ent, button, raycast)
    {
        print("Entity clicked: " + ent);
        this.toggleHover(ent);
    },
    toggleHover : function(ent)
    {
        var h = ent.GetComponent("EC_Highlight", this.highlightName);
        if (h == null)
        {
            print("- Enabling selection");
            h = ent.CreateComponent("EC_Highlight", this.highlightName, 2, false);
            h.temporary = true;
            this.selected = true;
        }
        else
        {
            print("- Disabling selection");
            ent.RemoveComponent(this.highlightName);
            this.selected = false;
        }
    },
    getSelectedEntities : function()
    {
        scene.GetEntitiesWithComponent("EC_Highlight", this.highlightName);
    },
    init: function()
    {
        print("Initialized");
        sceneinteract.EntityClicked.connect(this, this.handleClick);
        //me.Action("MousePress").Triggered.connect(this.handleClick);
    }
};
  if (server.IsRunning())
      thingie.init();
}


WidgetScript.prototype.SelectionActions = function(){
   var selectedList = scene.GetEntitiesWithComponent("EC_Highlight", this.highlightName);
   
   for (i in selectedList){
      print('Selected: ', selectedList[i]);
   
         /*
        Create some sort of inputmapping system to move selected object with 
        keyboard
        */    
   }
}








