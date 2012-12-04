var thingie =
{
    highlightName : "MySpecialHighlight",
    handleClick : function(ent, button, raycast)
    {
        print ("Entity clicked: " + ent);
        this.toggleHover(ent);
    },
    toggleHover : function(ent)
    {
        var h = ent.GetComponent("EC_Highlight", this.highlightName);
        if (h == null)
        {
            print ("- Enabling selection");
            h = ent.CreateComponent("EC_Highlight", this.highlightName, 2, false);
            h.temporary = true;
        }
        else
        {
            print ("- Disabling selection");
            ent.RemoveComponent(h, 2);
        }
    },
    getSelectedEntities : function()
    {
        scene.EntitiesWithComponent("EC_Highlight", this.highlightName);
    },
    init:
    {
        print ("client running");
        sceneinteract.EntityClicked.connect(this, this.handleClick);
    }
};
if (!server.IsRunning())
    thingie.init();
   
// Somewhere in your code
var selected = thingie.getSelectedEntities();
print ("Selected: ", selected);