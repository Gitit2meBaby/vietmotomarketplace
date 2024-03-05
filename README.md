## Immediate todos
- make another todo app like everybody else..
- sort UI fo rental posts
- consolidate how data is stored after submission of posts
- approach some color pallete Ui changes
- Create user to user messaging
- create Delete button for users with posts with auth == auth
- create home page with BS about why this app is the best
- continue making more blog posts, buyers guides, routes etc
- create an income stream through advertising
- implement fetch only 20 queries and a load more button for scrolling
- create the sort and filter component

# Firebase Backend
- Create user authentication
- Create rules to allow only users to upload and view contact details
- Have form to push to the database, create automatic deletion when the time is up/ after user pressed sold or make an automatic deletion time to clean up storage
- Make the photo upload have a maximum size, allow for one feature photo and 2 more to be uploaded per bike.
- Create two collections, one for selling bikes the other for rentals

# Bike Display Preview
- Create a preview section of the bike ad
- allow the user to edit it at this point
- have the final submit button work from here

## Global Context
- The bike list is going to have to be stored in global context
- Create filtering and sorting options to query the database
- create pagination so that only 20 results are retrieved, create a load more button that appears when the user reaches the end of the component and have onClick load another 20

## Decide on a functional approach to organising the database
- as learnt there needs to be collections of documents, I imagine it is going to be best t create a collection for each of the locations, then within this you could create a collection for the transmission type, this might reduce the amount of the database that needs to be searched through with each query

## Frontend
- Decide on a colour pallete
- Get straight to business with the bikes being displayed, use Hanoi and sort in order of cheapest first, this will show the most bikes and the lowest prices.
- mobile menu should enable the user to post a bike, refine search and check out the blog and routes
- log in button in top right, for MVP just choose a username to display, later look into using the google avatar or a chosen avatar


## Messaging App
1. Database Structure:
Firebase Firestore:
Create a new collection named rooms or similar.
Each document in the rooms collection represents a chat room.
Fields in the document may include:
participants: an array of user IDs involved in the conversation.
lastMessage: to track the latest message for notifications.
Any additional metadata you might need.
Messages Collection:
Inside each room document, create a subcollection named messages.
Each document in the messages collection should have the sender's ID, message content, timestamp, etc.
2. User Interface:
Post Component:
Add a "Message" button to each post.
When the user clicks the "Message" button, create a new room if it doesn't exist, or navigate to the existing room.
Messaging Component:
Create a messaging component that fetches messages from the selected room.
Display messages in chronological order.
Implement a form for sending messages to the room.
Notifications:
Use Firebase Cloud Functions or triggers to send push notifications when new messages are added to a room.
3. Navigation:
Direct Users to Chat:
When the user clicks the "Message" button, navigate them to the messaging component for that specific room.
Check Messages Button:
On the user's dashboard or profile, have a "Check Messages" button.
When clicked, navigate them to a page displaying all their active rooms.
4. Managing State:
Utilize state management (e.g., React Context API, Redux) to manage the current user, active room, and messages.
Ensure that when a user logs in, you fetch their active rooms and display any unread messages.
5. Multiple Messages for One User:
Handle the scenario where a user has multiple posts, and others send messages regarding different posts.
Implement a way to group these messages into a single room to improve UX.
6. Edge Cases:
Consider cases where a user might have multiple posts and others send messages regarding various posts.
Implement a way to associate messages with specific posts within a room.
7. Testing:
Thoroughly test the messaging functionality, including edge cases and scenarios involving multiple users and posts.
8. Security Rules:
Update Firebase security rules to ensure that users can only access their own messages and rooms.
9. Optimization:
Optimize the application for performance, considering factors like pagination for large message histories.
10. Documentation:
Document your messaging system, including data structures, components, and any Firebase rules or functions.


## STRUCTURE DATABASE
- Have the post Id become a room, use the post => listings.model as title

- When a user makes a post..
    - create a field hasMadePost (this will shorten the query to firebase on user Auth)

   # Onload (or even local state change)
    - Make that query (for all users with the field hasMadePost)
     if true, 
    - check through listings => where postId =>  conatins {userId:}
    
    - map through the postIds and create a room(chatBox) for each post in the messageCenter

- Now the messages center contains a sidebar with all the posts they have made.

# Other Users can join the room when clicking on the postId
- query listings => postId => (subcollection) messages
    - map through the two fields (fromSeller & fromBuyer)
    - Keep all of O.P's messages (fromSeller) on left and all other users can just message into the group.
    - new Messages become a document
    - new Messages from currentUserId !== userId(in the post fields) have their addDoc to field fromBuyer + timestamp, userId, displayName, avatar
    - useSnapshot to update instantly (query listings => postId => (subcollection) messages)
    - arrange using the timestamp in listings => postId => messages => {timestamp} 

- To avoid fetching everyone elses names and avatars (ie not readily available data (not currentUser or userId from seller)) set them to Anon if userId !== currentUserId, or just go with the extra fields in the messages document

Listings (root collection) => 
PostId (already implemented, first doc) => 
messages (sub-collection) =>
postId (document using same name as postId for ease) =>
{fromSeller:, fromBuyer:} (two fields within the document)


## CheckList
- Create a global provider for authentication.
- set up react router
- set up blur effect and sign in button over contact details when not signed in
- fix read and write in firebase console to only allow users
- get the images displaying only from correct post
- have react slider change according to amount of images uploaded
- make a bento design for desktop, show links to rent, buy, sell and latest posts
- look into only allowing a certain size file upload
- Find a color pallete, viet flag could be cool
- Create reusable sass variables for the buttons, but also the flags for 'auto', 'private' etc.
- fix the rendering of upload file, to 'change' text code, add some UI recognition of a succesfull upload beyond this.
- add lots of little i's for information tooltips
- write some blog articles, buyers guides and suggested routes.
- create the filtering and sorting component
- learn to query for only 20 posts, create a popup for load more at the bottom of the scroll.
- put a scroll to top arrow in.
- fix firebase bug that allowed for multiple sign ins with same email.
- show avatar in header when available, followed by display name trimmed to one word, if nothing else email trimmed with elipses.
- Set up facebook sign in
- Create some kind of auto deleting of old posts
- create a terms of service and privacy policy, link in authentication and footer