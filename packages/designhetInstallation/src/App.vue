<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app * {
  box-sizing: border-box;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  background-color: black;
  padding: 16px;
}
button {
  background: #f9423a;
  color: white;
  border: none;
  font-size: 1.2em;
  text-transform: uppercase;
  font-weight: bold;
  outline: none;
}
button.big {
  width: 100%;
  height: 60px;
  border-radius: 5px;
}
button.circle {
  width: 60px;
  height: 60px;
  border-radius: 30px;
}
</style>
