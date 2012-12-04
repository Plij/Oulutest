//Here need to ref all Props or scenes that we use, separately. Atm just some of them are here.

//!ref: C:\p2\Oulunew\Oulu3D\OgreScene\Props\sun.txml
//!ref: C:\p2\Oulunew\Oulu3D\OgreScene\Props\moon.txml
//!ref: C:\p2\Oulunew\Oulu3D\OgreScene\Props\butterfly_prop.txml
//!ref: C:\p2\Oulunew\Oulu3D\OgreScene\Props\palm.txml
//!ref: C:\p2\Oulunew\Oulu3D\OgreScene\Props\prop_volcano.txml

/*
A test snippet for demonstrating how we will be adding stuff to scene via GUI. So gui clickedButton() or what ever it is called in Qt calls for CheckSelected and passes the text,
which is in string the selected prop or other gadget. 

Also added removing 1 object via GUI and removing all objects via GUI. 

Added also the placement of new objects, which is generated automatically depending on if the new object is prop or scene.
*/

//Running on server side
if (server.IsRunning()){
    var text = "prop_volcano";
    CheckSelected(text);
}
else{
   // var text = "prop_volcano";
   // CheckSelected(text);
}

function CheckSelected (text){
  //Need to check if all props in one or separate arrays. These have to match the files in Props folder to work.
  //Also maybe make the URL a bit more generic to be easier to use anywhere.
  var propArray = ["palm", "prop_volcano", "moon", "sun", "butterfly_prop"];
  
  for(i = 0; i<propArray.length; i++){
    if(propArray[i] == text){
      print(propArray[i] + '.txml', text);
      var assets = scene.LoadSceneXML(asset.GetAsset("C:/p2/Oulunew/Oulu3D/OgreScene/Props/" + text + ".txml").DiskSource(), false, false, 0);
      var ent = scene.GetEntityByName(text);
    }else
       print('text is wrong.', text, propArray[i]);

  }
}

//Function for removing single entities, text being the entitys name in string that we want to remove. Has to be passed via GUI.
function RemoveEntity(text){
    var ent = scene.GetEntityByName(text);
    scene.RemoveEntity(ent.Id());
}

//Remove all entities, have to be dinstinguished with a certain component name.
function RemoveAllEntities(){
  var ents = scene.GetEntitiesWithComponent('EC_DynamicComponent');
  for (i = 0; i<ents.length; i++){
    scene.RemoveEntity(ents[i].Id()); 
  }

}

