# Find And Replace

The Find And Replace Dashboard App allows you to search for any entry field and replace its values. Changing bulk entries is made easier with this application.


###  Prerequisites

- Basic understanding of JavaScript
- Contentstack account.
- Node.js version v14.16.0
 
### Set Up Your App


- Run the app on localhost 
- Hosted app 
- Developer hub setup



####  Run the app on localhost 

- Go to <APP_DIRECTORY>/ui directory in terminal and run following command.
 ```sh
cd ui
npm i
```
- Run following command.
 ```sh
npm run start
```
- Copy the localhost link for your App Url  http://localhost:8000 (for running the app locally)

####  Hosted app 
- This App can be hosted on any platform of your choice.

##### Create App Build 


- Go to <APP_DIRECTORY>/ui directory in terminal and run following command.
 ```sh
npm run build
```


##### Host on vercel

-  Here is the Vercel Doc for Hosting git repo https://vercel.com/docs/concepts/git/vercel-for-github
-  In the vercel Select Root Directory /ui.
![Vercel](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt8b5d824fef6cadfb/636e2447fde4123315e85ff6/Screenshot_2022-11-11_at_4.00.10_PM.png)
-  Here is the demo link for the app, which is hosted on Vercel : https://find-replace-app.vercel.app/

#### Developer hub setup
- Go to the [developer hub](https://app.contentstack.com/#!/developerhub)
- Click the "+ New App" button at the top to create a new app.

![New App](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/bltf7d633091a4af5bf/636e099c7487894eca7dd0ae/Screenshot_2022-11-11_at_1.45.44_PM.png)

- Next, select the Stack App. Then call your app "Find And Replace". 

![Name App](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt140198cd6fcbc7cd/636e09a6d8bead2f11377f00/Screenshot_2022-11-11_at_1.47.19_PM.png)

- Then click on App "UI Locations"(1) and add your App Url(2 Hosted Or localehost).then click on "Save" button(3), after that in "Available location(s)", click on  "Stack Dashboard" and "+ Add"(4). 

![Setup App](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt615e6d73962d2a98/636e4592bdef432fb152cd96/Screenshot_2022-11-11_at_6.20.10_PM.png)

- Next step, after that in the Path add /dashboard-widget and select Default Width as "Full Width".

![Setup App](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt9225848a028e16a0/636e0de6cb903f11376856a5/Screenshot_2022-11-11_at_1.59.32_PM.png)

- After that click on "Install App", Select Stack and click on "Install".

![install App](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt5547f77ac975a695/636e09c80b5d2311678e6c1e/Screenshot_2022-11-11_at_2.01.53_PM.png) 

![install App](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt4f9daf26ab01d006/636e09d22e16be076e6e019a/Screenshot_2022-11-11_at_2.03.06_PM.png) 

![Done](https://images.contentstack.io/v3/assets/blt1c11a1ad74628afa/blt2cb47fab149101a9/636e09db9b6e5010c448f980/Screenshot_2022-11-11_at_2.04.32_PM.png) 

### Please  Note 

- As of now, we do not support References, json rte and assest replace.
