## Firebase Backend
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