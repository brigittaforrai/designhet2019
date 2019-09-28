<template>
  <div class="connect" style="color: white">
    <header>
      the flow
    </header>

    <Remote v-if="this.connected"></Remote>
    <button @click="connect"
            class="big"
            v-if="!this.connected"
            :disabled="!this.opened">{{connectBtnText}}</button>
  </div>
</template>

<script>
import io from 'socket.io-client'
import Remote from './remote.vue'
import {server} from './../config.js'

export default {
  name: 'Connect',
  components: {
    Remote
  },
  data() {
    return {
      socket : io(server),
      connected: false,
      opened: false
    }
  },
  computed: {
    connectBtnText() {
      return this.opened ? "Connect to play" : "Someone is playing"
    }
  },
  mounted () {
    this.socket.on('OPEN', (data) => {
      this.opened = data.open
      console.log(data.open, 'init isopen?');
      // connection closes
      if (this.opened && this.connected) {
        this.connected = false
      }
    })

    this.socket.emit('ISOPEN')
  },
  methods: {
    connect () {
      this.connected = true
      this.socket.emit('CONNECTED')
    },
    disConnect () {
      this.socket.emit('DISCONNECT')
    }
  }
}
</script>

<style scoped>
  .connect {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }
</style>
