# SpeedSync - by up2047683

## Brief description
SpeedSync is a lightweight offline-first app for managing race timings at outdoor events, such as the Pub-to-Pub run. The interface is designed with accessibility and modern minimalism in mind (because some race timers look too basic for me) for use in winter conditions by older volunteers with limited technical experience. 

(PSA)
I have left some bits of code in even though it might seem redundant at this current time to show my thought process as well as if someone was to come in and decided to modify the code for future functionality they could. For example, the timer clock was built first with milliiseconds for accuracy. However, after a while it was straining me looking at it moving so fast and so removed milliseconds(I thought elder people would also feel the same way!). However, if someone wanted to change it later then the code is there for them to be able to modify! 

---

## Key Features


### Registering Runners
You can register runners on the homepage by entering their Race ID or bib number shown in the UI and clicking "Save Runner" or pressing Enter. The list of runners is saved in local storage, allowing the app to work offline.

**Design Note**: Input validation prevents non-numeric or duplicate IDs. I used localStorage to reduce reliance on server-side databases during offline usage.

---

### Deleting Runners
Each runner entry has an '×' button to delete them before the race starts. A confirmation prompt prevents accidental deletions. This was in mind for maybe more elderly participants (becuase my grandma clicks everything on her phone and deletes things accidentally when she didnt mean to) and in my opinion important when designing for everyone in mind!

**Design Note**: I implemented `.filter()` to remove selected IDs and update the DOM instantly for a responsive UI.

---

### Timer Page
Clicking "Start Race Timer" takes you to `timer.html`, where timing functionality begins. Just click 'Start'! In order to for the race to begin. There is a dropdown menu (Select Runner) where you can select a runners bib number and then press 'record time'. this instantly creates a mini view where you can see all the recorded times. 

**Design Note**: The app enforces at least one registered runner before allowing transition, preventing empty race sessions.

---

### RESET
the reset button resets the timer as well the recorded race results for simplicity in mind so it is easy to restart a new timer if needs be. All the buttons are coloured visually and boldly for anyone to easily be able to distinguish what each buttons does and their use cases.

### Dark Mode
A dark mode toggle button switches between themes and saves the user's preference in localStorage. The dark mode is consistant throughout the app when toggles either on or off. Will find on the top right corner of each screen.

**Design Note**: Improves usability in low-light environments especially for users with bad vision or sensitive to the light from their phones. State is stored between sessions using a boolean string (`'true'` or `'false'`).

---

### Connection Status
Displays a real-time indicator of online/offline status. This is consistant on all screens of the app. 

**Design Note**: Listens to `online` and `offline` events via `window.addEventListener`, and updates the UI accordingly.

---

### CSV export
On the results page there is a export button. This enables the user to download the results offline as well 

---

### ADMIN page 
I decided that Admins should be able to have full access to the server results and so made a seperate admin page(kinda last minute) which can be viewed by vising: http://localhost:8080/admin.html
password: pub2pub2025
the admin page requires a password for extra security of course! to then the admin can view the race results in the database and can wish to delete them one by one or delete them all. I didnt want to make this screen too fancy as i thought the admin would just want the results and nothing more(sorry Rich!)
This was page was made dedicated to show that users on the app can delete results using LocalStorage however, the race results were still in tact in the database until the admin decides to delete them
 


## AI

I used AI for some development to clarify technical problems and enhance design thinking. Below is a detailed list of prompts and outcomes:

---

### Prompts to develop Local Storage logic
> How can I store an array of numbers in localStorage and retrieve it in JavaScript?

ChatGPT suggested using `JSON.stringify()` and `JSON.parse()`. This worked well and I implemented this pattern to store and retrieve runner IDs.

---

### Prompts to fix Duplicate ID bug
> My app lets you add duplicate runner IDs. How can I prevent this?

ChatGPT suggested checking if the ID already exists using `.includes()`. I added a validation step before pushing to the array.

---

### Prompts to implement Dark Mode toggle
> How do I create a dark mode switch with a button in vanilla JS?

ChatGPT provided a class-based toggle and suggested using `localStorage` for saving preferences. I adapted this to fit my app layout and CSS structure.

---

### syncing problems and inserting multiple race resutls into the databse table 
> At the moment when i upload race result to the server it keeps inserting the race results multiple times? how can i fix this ?

AI then identified I had two SyncResultWithServer() functions which one of them i used for testing so it suggested me to delete one.

HOWEVER, it told me to delete the one i was most happy with better error handling. At first i deleted it and my results were not syncing at all! I decided to delete the other one and then proceeded to say

> I deleted the one you suggested to keep. Now my original problem is fixed so going forward if i have a problem remember which function I kept just in case we need to trouble shoot

This taught me most things AI suggests is not 100% accurate but can point me in the right direction of what COULD be the problem or near abouts 


### Removing my database creation from originally my server.js to setup.js file 
> is there anything I should remove from my server.js?

To then ChatGPT said there was nothing wrong with my original server.js file

> my lecturer will run:
npm install 	… and then,
npm run setup 	… and then,
npm start
currently i know npm start will work and npm install. Im not sure about the npm run setup

Then chatGPT suggested i remove my database table creation to a file called setup.js which I did.

> Is that all I have to change in my code in order for nothing to break. walk me step by step of what i have to do next in order for npm run setup to work when my lecturer starts my code

Then ChatGPT said I must also change my script in package.JSON. 

I found this really helpful because before this CW I didnt know very much on these commands and what they did. But now I have learnt what they do and where I needed to place things 

### Syncing problem 
> I am using SQLITE but everytime i submit results to the server it is taking ages for my results to be inserted into the database? any ideas.

AI then suggested the nature of SQLITE it might take a bit of a buffer period until the results get inserted 

> Okay thats fine. However I need the results to be submitted to the server faster after viewing the results. 

AI then suggested we add a 30 second buffer to allow the race results to be inserted. After which i also added immediate syncing if the user was to come back online and kept the 30 seconds syncing as a safety sync feature

### Scared of shutting down database without confirmation
> I just got my database up and running again. How do i shut it down properly this time without the database getting corrupted again? Even if its simple.

AI suggested:
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Maybe: "To stop the server, press Ctrl + C in the terminal."

> Okay so all i need to remember next time is is press Ctrl + c in the terminal to properly shut it down? and if so when i go to shut it down how do i know if it is ? can i display a message in the terminal after? 

AI then suggested I do the following so I can relax and know for sure the database shut down properly:
process.on('SIGINT', () => {
  console.log('Server stopped');
  process.exit(0);
});

I then modified it further which you can see at the bottom of server.js file to make me feel more confident about closing it down and with further research used db.close when I shut it down to minimise futher risk of corruption! 

### Batch Insertion to the database 
> Iv never used express before. so what is the simplest way for me to add my results results into my SQLite database? 

AI then suggested:
app.post('/results', (req, res) => {
  const result = req.body;
  db.run(
    'INSERT INTO results (runner_number, finish_time, recorded_at) VALUES (?, ?, ?)',
    [result.runner_number, result.finish_time, new Date().toISOString()],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.sendStatus(200);
    }
  );
});

This did not support a batch insertion as well there was no real error handling and so AI gave me the most bare bone way to do it really

I then said:
> How do I insert multiple race results into a SQLite database using Express, with minimal error handling?
As you can see my prompt got more specific to what I wanted

Ai then suggested:
app.post('/results', (req, res) => {
  const results = req.body;

  results.forEach(result => {
    db.run(
      'INSERT INTO results (runner_number, finish_time, recorded_at) VALUES (?, ?, ?)',
      [result.runner_number, result.finish_time, new Date().toISOString()],
      err => {
        if (err) console.error(err);
      }
    );
  });

  res.status(200).json({ message: 'Results inserted' });
});

This was a good starting point for me and then I got an idea of what I needed to do. I further improved from the prompts I was given to get me to the final version of it in server.js. It showed me i needed to be more specific with my prompts eben just to get started


Overall AI did help me get started somethings and also enabled me to solidify my understanding bettr of concepts I already knew. As shown I had to progressively get better with my prompts and be more specific to actually get what I wanted but in the end I found for a larger project like this it still gave me quite simplified repsonses to problems I had but I was able to navigate these problems doing my own further research and reading. 


### What went right / wrong
✅ Using ChatGPT helped me break down problems I might have been experiencing 

✅It helped me identify errors i might have overlooked or maybe someplaces where i forgot to take out some code and hence why some functions were not working properly 

✅ I appreciated the lightweight nature of vanilla JavaScript and the control it gave me over functionality and performance

✅ I successfully implemented a graceful shutdown for the server, something I wouldn't have known to do early on — this gave me confidence that I’m thinking more like a backend developer.

✅ This project definitely taught me theres a lot of components that goes into buuidling a webapp and I had grown in several ways as engineer such as core JS skills, working with SQLite and Express and helped me understand routes. 

✅ Tried my best using semantic markup and giving my variables meaningful names to make it easier for someone else to pick up my code. I also know that using semantic is important when it comes to SEO for future web programming applications I will make in the future. 

---

⚠️ I had a NIGHTMARE at the beginning with my database because it got corrupted. ChatGPT made me panic more and actually give me random solutions which wasnt working. 

⚠️ I initially stored finish times on the frontend without converting to a consistent format, which made sorting results unpredictable at the beinning.

⚠️ I didn’t plan out the full offline-first flow early enough, so syncing logic had to be retrofitted rather than designed from the beginning.

⚠️ I didn’t validate user input on the frontend initially, which caused errors when non-numeric or blank runner numbers were submitted.

---


💡 This project taught me how to reason about code in a real-world setting — beyond coursework — where user input is messy, databases can get corrupted, and syncing isn’t always reliable.

💡 I realised that simplicity matters: I kept the UI minimal to avoid distracting users, and learned how to design for minimalism but also modern to a degree 

💡 I now better appreciate why frameworks exist — managing DOM elements, event listeners, and UI state manually was educational, but also showed the limits of vanilla JS at scale.

💡 I learned that AI is a great coding assistant, but not a substitute for thinking through design, user flow, and edge cases myself.

---

📈 I would plan data structures and database schema earlier, including constraints like unique a lot earlier so I didnt run into a lot of teething problems with the database

📈I’d add clearer success/error messages when a result is submitted or deleted. By that I mean make custom error pop ups insetad of the default design. 

📈 Add more user roles next time. For example specator modes 

📈 Accessibility testing. Make it more usuable by adding screen readers


## Final Thoughts/Reflection

This project has been one of the most rewarding courseworks I have done so far at uni. Not only did I get to apply core JavaScript concepts without relying on frameworks, but I also gained real-world backend experience using Express and SQLite in a server-driven environment. I had to think like both a developer and a user (things we are learning in the usability classes) — building something robust enough for others to interact with while still keeping it simple and responsive.

💡 This coursework has sparked a genuine passion for web and mobile development. Since starting this project, I’ve begun building my personal portfolio site and have already spoken to a few local business owners about creating websites for their companies. This coursework has become a launchpad for freelancing or even my own startup one day.

Using AI in some aspects has helped me move faster and clearer, especially when I felt stuck. However, I never blindly copied and pasted solutions. I treated AI like a coding partner — adapting its advice to fit the unique requirements of my offline-first, accessibility-focused application. At times, I went beyond the basic suggestions to implement better structure and error handling, such as graceful shutdowns, input validation, and bulk inserts.

That said, I’m still learning and refining my approach. If I were to revisit the project, I’d definitely improve aspects of the UI — spacing out timer buttons to reduce accidental clicks, enhancing visual clarity for older users, and how I handled the CSS aspects of the code such as making one big CSS utility file from the beginning. I’d also spend more time testing and working with larger data sets to simulate real race-day use.

Ultimately, this project gave me hands-on experience in full-stack development, improved my debugging and problem-solving skills, and opened up new possibilities for where I might take my skills next.
