/*
 * Author: Lasse Annola
 * This script is used to remove inputmappings we don't want to use and place our FreeLookCamera into the right position. This is loaded thru MainMenu.js
 *  SetCamera(); function.
 */
function CamScript(entity, comp){
  this.me = entity;

}

function SetCam(){
 var im = this.me.GetComponent('EC_InputMapper');
  if(!im){
    console.LogInfo('Inputmapper not found');  
  }else{
    var tm = this.me.placeable.transform;
    tm.pos.x = -92.15;
    tm.pos.y = 23.09;
    tm.pos.z = -73.65;
    tm.rot.x = -19.8;
    tm.rot.y = 263.7;
    tm.rot.z = 0;
    this.me.placeable.transform = tm;
    
    if(!this.me.inputmapper){
      console.LogInfo('Cant find inputmapper!');
    }else{
      this.me.inputmapper.RemoveMapping('A', 1);
      this.me.inputmapper.RemoveMapping('D', 1);
      this.me.inputmapper.RemoveMapping('A', 3);
      this.me.inputmapper.RemoveMapping('D', 3);
      this.me.inputmapper.RemoveMapping('Space', 3);
      this.me.inputmapper.RemoveMapping('Space', 1);
      this.me.inputmapper.RemoveMapping('Up', 1);
      this.me.inputmapper.RemoveMapping('Up', 3);
      this.me.inputmapper.RemoveMapping('Down', 1);
      this.me.inputmapper.RemoveMapping('Down', 3);
      this.me.inputmapper.RemoveMapping('Left', 1);
      this.me.inputmapper.RemoveMapping('Left', 3);
      this.me.inputmapper.RemoveMapping('Right', 1);
      this.me.inputmapper.RemoveMapping('Right', 3);
      this.me.inputmapper.RemoveMapping('C', 1);
      this.me.inputmapper.RemoveMapping('C', 3);
     }

  }

}

if (server.IsRunning())
  console.LogInfo('CamScript loaded to FreeLookCam');
else
  SetCam();
