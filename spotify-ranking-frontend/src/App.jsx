import React, {useState} from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import './App.css';

// Test Ranklijst playlistId="04aJaehGXas3rrOM0FDEsA"

const App = () => {

  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

export default App;
