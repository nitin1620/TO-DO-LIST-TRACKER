module.exports.getDate=function (){ //module.exports is an object so we can set it's values to many functions

    let today = new Date();
  
    let options = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return today.toLocaleDateString("en-US", options);
}
module.exports.getDay=function() {
    let today = new Date();
  
    let options = {
      weekday: "long",
      
    };
    return  today.toLocaleDateString("en-US", options);
}
// instead of module.exports we can use exports also