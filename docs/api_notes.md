API documentation as of June 7th.

## News

/api/newsfiles  
	max: int  
	fileNames: array[string]  
	This will list all markdown files stored in `/public/content/news`  

/api/newsheaders  
	max: int  
	fileNames: array[string]  
	firstLines: array[string]  
	The same as `/api/newsfiles`, but also has `firstLines`, which lists the headers of each file on a 1-to-1 basis.  

## Public API

For the public API, the "idx" of creatures, etc. will never change. These are what you need to use for querying specific entries. They usually match the entry's `name` field, but not always. `idx` are used as keys for the returned results.  

/api/creatures[?creature=idx[,idx...]]  
	string: object  
	[...]  
	When called without a parameter, this returns an object with keys and values representing all creatures currently in the game.  
	When called with a comma-separated `creature` parameter, it filters the result to only match the listed creatures. In the event of an invalid argument, the returned value of the key/value pair is `null`.  

/api/items[?item=idx[,idx...]]  
	string: object  
	[...]  
	When called without a parameter, this returns an object with keys and values representing all items currently in the game.  
	When called with a comma-separated `item` parameter, it filters the result to only match the listed items. In the event of an invalid argument, the returned value of the key/value pair is `null`.  
	Premium items are mixed in with regular items, but have a key/value field `premium: true`.  

/api/moves[?move=idx[,idx...]]  
	string: object  
	[...]  
	When called without a parameter, this returns an object with keys and values representing all moves currently in the game.  
	When called with a comma-separated `move` parameter, it filters the result to only match the listed moves. In the event of an invalid argument, the returned value of the key/value pair is `null`.  

/api/elements[?element=idx[,idx...]]  
	string: object  
	[...]  
	When called without a parameter, this returns an object with keys and values representing all elements currently in the game, and their strength against other elements (i.e. double strength is listed as 2, half strength as 0.5, etc.)  
	When called with a comma-separated `element` parameter, it filters the result to only match the listed elements. In the event of an invalid argument, the returned value of the key/value pair is `null`.  

