# My Rep
An Alexa skill for getting information about your congressional representatives.

My Rep is built with the Alexa Skills Kit Node SDK and allows users to ask for information about members of congress, like "What is Paul Ryan's phone number?" or "Give me Nancy Pelosi's office address."

The Sunlight Foundation API is used to get the list of congressperson aliases to use as slots and to toss into a DynamoDB for referencing their bioguide ID. The database might end up being unnecessary in light of Alexa's new entity resolution feature, but that'll require a little more testing. 

To actually get the response to a user query, My Rep uses Propublica's API. In subsequent versions, I want to make use of Google's Civics API for location searching, as well. 
