# cardgame

web app for playing cards

NOTE: update external types by manually running the following from the root directory:

`npx hjson -js schemas/${FILE}.hjson | npx json2ts > client/models/external/${FILE}.d.ts`

where ${FILE} is the name of a file (e.g. ScryfallCardData)
