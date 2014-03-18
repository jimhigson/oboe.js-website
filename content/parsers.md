Oboe.js vs SAX vs DOM
=====================

Oboe.js aims to be fluid like a SAX parser but with the convenience of a DOM parser.
 
Choosing a parser
-----------------

DOM pros:

* It is very simple. Everybody knows how to use it.
* The parsing is fast and native using `JSON.parse`

DOM cons:

* You can't do anything until you have the whole document.
* If the connection drops while transfering you lose everything.
* Perpetual documents are not possible.
 
SAX pros:

* It has lean memory requirements. It can handle documents larger than the available RAM.

SAX cons:

* The API is very low level. Simple tasks need quite a lot of programming.

Oboe.js pros:

* Finding nodes is pattern-based. Unlike SAX, you don't have to maintain state on what you have alredy seen
in order to drill down into a JSON document.
* Oboe's parser provides actual JS objects which can then be used much as you would with a DOM parser. In
comparison, with SAX you must programatically infer objects from many callbacks.
* Can be used to search the JSON while streaming is flowing.
 
Oboe.js cons:

* Since it builds up the parsed result as actual JSON objects parsing a document takes about the same memory as a DOM parser.

Code comparison: SAX
--------------------

We have JSON containing an array of people objects and we wish to extract the
name of the first person. Using SAX this is quite involved:

``` js
function extractNameOfFirstPerson(){

   var parser = clarinet.parser(),
   
       // With a SAX parser it is the developer's responsibility 
       // to track where in the document the cursor currently is.
       // Several variables are required to maintain this state.        
       inPeopleArray = false,   
       inPersonObject = false,
       inNameAttribute = false,
       found = false;
   
   parser.onopenarray = function(){
      // For brevity we'll cheat by assuming there is only one
      // array in the document. In practice this would be overly
      // brittle.      
      inPeopleArray = true; 
   };
   
   parser.onclosearray = function(){
      inPeopleArray = false;
   };   
   
   parser.onopenobject = function(){
      inPersonObject = inPeopleArray; 
   };
   
   parser.oncloseobject = function(){
      inPersonObject = false;
   };   
      
   parser.onkey = function(key){
      inNameAttribute = (inPeopleObject && key == 'name');
   };

   parser.onvalue = function(value){
      if( !found && inNameAttribute ) {
         // finally!
         console.log('the name is', value); 
         found = true;
      }
   };      
   
   // return the parser to be hooked up to a stream
   return parser;   
}
```

Code comparison: Oboe.js
------------------------

Oboe makes extracting the name very much easier, but reacts equally quickly
to the streamed input as the SAX example above:

``` js
oboe('people.json')
   .node('[0].name', function(name){
      console.log('the name is', name);
   });
```






