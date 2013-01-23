/*
Not used for anything atm.
*/

function EntityScript(entity, comp){

  this.me = entity;
  frame.Updated.connect(this, this.Update);
  console.LogInfo('Entityscript initialized');
  //This print works. It prints AnimationController name: "", DynamicComponent name: ""
  console.LogInfo(this.me.dynamiccomponent);


}

EntityScript.prototype.CheckAnims = function(){
  if(this.me.animationcontroller.GetAvailableAnimations().length > 0){
    this.EnableAnims();
    this.me.dynamiccomponent.CreateAttribute()
  }else
    frame.DelayedExecute(0.1).Triggered.connect(this, this.CheckAnims);
}

EntityScript.prototype.EnableAnims = function(){
    this.me.animationcontroller.EnableAnimation('PropAnim');
    this.me.animationcontroller.EnableAnimation('SceneAnim');

} 

EntityScript.prototype.Update = function(frametime){
  if(server.IsRunning()){
    
  
  }else{
    if(!this.me.dynamiccomponent)
      console.LogInfo('Wtf');
    else if(this.me.dynamiccomponent.GetAttribute('Placed') == true)
      this.CheckAnims();  
  }

}