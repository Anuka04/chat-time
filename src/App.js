import React, { Component, useEffect, useRef, useState } from 'react';

import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBHznevYG8h9uclRXWrYlqm5Y2Zdqb630Y",
    authDomain: "chat-a6f9a.firebaseapp.com",
    projectId: "chat-a6f9a",
    storageBucket: "chat-a6f9a.appspot.com",
    messagingSenderId: "799554253009",
    appId: "1:799554253009:web:0cc6bef2d2cf181f1155f0",
    measurementId: "G-FD7X57164D"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App border-bg h-screen">
      <SignOut />
      <section className="flex justify-center items-center h-screen">
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}


function SignIn() {
  const signInAnonymously = () => {
    const provider = new firebase.auth().signInAnonymously();
   auth.signInAnonymously(provider);
  }
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <button className="mt-auto bg-white outline-none focus:outline-none p-2 m-3 border-b-4 border-gray-500 hover:bg-gray-200 hover:border-gray-500 transition-all duration-75 ease-in-out rounded inline-flex items-center" onClick={signInAnonymously}>
        
        <span className="block">Go to chat</span>
      </button>
      <p> Press above icon to start chatting</p>
     
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <div className="w-full">
      <button className="absolute hover:shadow-xl hover:text-pink-900 transition-all duration-75 ease-in-out rounded-full p-2 bg-white signout-btn material-icons" onClick={() => auth.signOut()}>exit_to_app</button>
    </div>
  )
}









function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { displayName, uid } = auth.currentUser;

    await messagesRef.add({
      user: displayName,
      body: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="chat-bg w-full sm:w-2/3 p-2 rounded">
      <div className="overflow-y-auto h-screen-90">
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </div>

      <form onSubmit={sendMessage} className="pt-3 w-full inline-flex">
        <input className="rounded-half px-3 w-full py-1 outline-none focus:shadow" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something" />
        <button className={`material-icons p-2 mx-2 bg-white rounded-full transition-all duration-75 ease-in-out text-xl ${!formValue || 'text-pink-700 hover:text-pink-900'}`} type="submit" disabled={!formValue}>send</button>
     
      </form>
    </div>
  )
}


function ChatMessage(props) {
  const { user, body, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'flex-row-reverse' : 'flex-row';
  const messageBodyClass = uid === auth.currentUser.uid ? 'sent-message-bg text-right' : 'received-message-bg';
  const imageClass = uid === auth.currentUser.uid ? 'ml-2' : 'mr-2';

    return (
      <div className={`px-3 py-2 flex no-wrap items-start ${messageClass}`}>
        <div className={`block w-80 break-words p-2 rounded-md ${messageBodyClass}`}>
          <p className="text-xs">{user}</p>
          <p>{body}</p>
        </div>
      </div>
  )
}

export default App;