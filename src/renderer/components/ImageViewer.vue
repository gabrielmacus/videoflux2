<template>

  <div class="container" >
    <GlobalEvents
      @keydown="onKeyPress"
    />
    <!--
    <span class="image-counter">{{imageIndex + 1}}/{{images.length}}</span>
  -->

    <div v-if="loadingImages" class="loader">
      <div class="lds-dual-ring"></div>
    </div>


    <div class="time-zoom-container">
      <span class="title-zoom">Datos de la cámara</span>
      <div class="time-zoom">
        <img  :src="filteredImages[imageIndex].path" />
      </div>
    </div>

    <div class="image-viewer"  >
      <div  
        v-bind:key="index.name"
        v-if="index % (imageSkip + 1) == 0 || imageIndex == filteredImages.length"
        class="image" 
        :class="{active:(index == 0)}" 
        v-for="(image, index) of filteredImages.slice(imageIndex,imageIndex + (imagesPreloaded * (imageSkip + 1)))">

        <img  :style="`filter: saturate(${saturation}) brightness(${brightness});`" :data-viewer-image="index" :src="image.path"  >
        <span class="counter">{{imageIndex + 1}} / {{filteredImages.length}}</span>
        



      </div>
      <div v-if="filteredImages.length == 0" class="no-images" >
        <p>No hay imágenes para mostrar</p>
      </div>

      <div class="speed-control">
        <template v-if="!showKeyOnly || keyImagesNotPresent">
        <span @click="setImageSkip(0)" :class="{active:imageSkip == 0}">x1</span>
        <span @click="setImageSkip(1)" :class="{active:imageSkip == 1}">x2</span>
        <span @click="setImageSkip(2)" :class="{active:imageSkip == 2}">x3</span>
        <span @click="setImageSkip(3)" :class="{active:imageSkip == 3}">x4</span>
        </template>

        <template v-if="!keyImagesNotPresent">
        <span @click="toggleShowKeyOnly()" v-if="!showKeyOnly" >Ver F3</span>
        <span @click="toggleShowKeyOnly()" v-if="showKeyOnly" >Ver todo</span>
        </template>
        
      </div>

    </div>
    <!---
    <div  v-if="images.length > 0" class="image-filters">
      <div class="filter">
        <label>Saturación</label>
        <vue-range-slider :use-keyboard="false" style="padding:0" :min="1" :max="5" :step="0.5"  v-model="saturation"></vue-range-slider>
      </div>

      <div class="filter">
        <label>Brillo</label>
        <vue-range-slider :use-keyboard="false" style="padding:0"  :min="1" :max="5" :step="0.5" v-model="brightness"></vue-range-slider>
      </div>


    </div>-->


  </div>
</template>
<script>

  window.addEventListener('keydown', (e) => {
      if (e.target.localName != 'input') {   // if you need to filter <input> elements
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
              e.preventDefault();
          }
      }
  }, {
      capture: true
  });


  import GlobalEvents from 'vue-global-events'
  import 'vue-range-component/dist/vue-range-slider.css'
  import VueRangeSlider from 'vue-range-component'
  import Vue from 'Vue'

  let imageTimeout = null;
  export default {
    name: 'image-viewer',
    props: ['images','imageIndex'],
    data(){
      return {
        imagesPreloaded:15,
        saturation:1,
        brightness:1,
        imageSkip:0,
        showKeyOnly:true,
        lastFilteredImageIndex:0,
        loadingImages: false,
        keyImagesNotPresent:false

      }
    },
    components: { VueRangeSlider, GlobalEvents },
     watch: {
        images () {
          if(this.images.filter(i => i.name.match(/^[0-9]{1,}-key\.jpg$/)).length == 0)
          {
            this.keyImagesNotPresent = true;
          }
          else
          {
            this.keyImagesNotPresent = false;
          }
        }
    },
    computed:{
      filteredImages()
      {
        if(this.showKeyOnly && !this.keyImagesNotPresent)
        {
          return this.images.filter(i => i.name.match(/^[0-9]{1,}-key\.jpg$/))
        }
        return this.images;
      },
      imagesLoaded()
      {
        let completed = false;
        document.querySelectorAll("[data-viewer-image]").forEach((image)=>{
          if(!image.complete)
          {
            completed = false;
            return;
          }
          completed=true;
        });
        return completed;
      }
    },
    methods: {
      toggleShowKeyOnly()
      { 
        this.loadingImages = true;
        
        const selectedImageName = this.filteredImages[this.imageIndex].name;

        this.showKeyOnly = !this.showKeyOnly;
        if(this.showKeyOnly)
        {
          this.setImageSkip(0);
          this.$emit("update:imageIndex",this.lastFilteredImageIndex);
          
        }
        else
        {
          this.lastFilteredImageIndex = this.imageIndex;
          const index = this.filteredImages.findIndex(i => i.name == selectedImageName);
          this.$emit("update:imageIndex",index);
        }
        let self = this;
        setTimeout(()=>{
          self.loadingImages = false;
        },1000);
        
      },
      setImageSkip(i){
        this.imageSkip = i;
      },
      navigateBackwards(){
        let self = this;

        if(self.loadingImages){
          return;
        }

        if(imageTimeout || !self.imagesLoaded || self.imageIndex == 0)
            {
              return;
            }
            imageTimeout = setTimeout(function () {
              //self.imageIndex = self.imageIndex - 1;
              let newIndex = self.imageIndex - 1 - self.imageSkip;
              if(newIndex < 0)
              {
                newIndex = 0;
              }
              self.$emit("update:imageIndex",newIndex);
              clearTimeout(imageTimeout);
              imageTimeout = null;
            }, 35);
      },
      navigateForwards(){
        let self = this;

        if(self.loadingImages){
          return;
        }
        
        if(imageTimeout || !self.imagesLoaded || self.imageIndex == self.filteredImages.length - 1)
            {
              return;
            }
            imageTimeout = setTimeout(function () {
              //self.imageIndex = self.imageIndex + 1;
              let newIndex =self.imageIndex + 1 + self.imageSkip;
              if(newIndex > self.filteredImages.length - 1)
              {
                newIndex = self.filteredImages.length - 1;
              }

              self.$emit("update:imageIndex",newIndex);

              clearTimeout(imageTimeout);
              imageTimeout = null;
            }, 35);
      },
      async onKeyPress(e){
        await Vue.nextTick();
        let self = this;
        let timeout = null;
        switch (e.code) {
          case 'ArrowUp':
            if(this.keyImagesNotPresent)
            {
              return;
            }
            if(self.showKeyOnly)
            {
              self.toggleShowKeyOnly();
            }
            self.navigateForwards();
            break;
          case 'ArrowDown':
            if(this.keyImagesNotPresent)
            {
              return;
            }
            if(self.showKeyOnly)
            {
              self.toggleShowKeyOnly();
            }
            self.navigateBackwards();
            break;
          case 'ArrowRight':
            if(!self.showKeyOnly)
            {
              self.toggleShowKeyOnly();
            }
            self.navigateForwards();
            break;
          case 'ArrowLeft':
            if(!self.showKeyOnly)
            {
              self.toggleShowKeyOnly();
            }
            self.navigateBackwards();
            break;
          case 'F4':
            self.toggleShowKeyOnly();
            break;
          case 'F1':
          case 'F2':
          case 'F3':
            const path = self.filteredImages[self.imageIndex].path;
            const index = self.images.findIndex(i => i.path == path);
            self.$emit('imageCaptured',{path,image:index + 1,captureNumber:e.code.replace("F","")});
            break;
          case 'Numpad1':
          case 'Numpad2':
          case 'Numpad3':
          case 'Numpad4':
          case 'Digit1':
          case 'Digit2':
          case 'Digit3':
          case 'Digit4':
            if(e.target.localName != 'input')
            self.setImageSkip(parseInt(e.key)-1);
          break;

        }
      }
    }
  }
</script>

<style lang="scss" scoped>

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loader
{
  display: flex;
  align-items: center;
  justify-content: center;
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height: 100%;
  background: rgba(0,0,0,0.75);
  z-index: 2;
}
.time-zoom-container
{
  position: relative;
  .title-zoom
  {
    right: 10px;
    background: white;
    padding: 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    position: absolute;
    bottom: 10px;
    z-index: 123;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  }
  .time-zoom
  {
    height: 150px;
    position: relative;
    overflow: hidden;
  }
  img
  {
    height:150px;
    position: absolute;
    transform: scale(4.45) translateY(40%) translateX(6%);
    filter: invert(100%) saturate(250%);
  }
}
.speed-control{
  span{
    display: block;
    cursor:pointer;
    padding: 0.5rem

  }
  span.active
  {color:black;background: white;}
      display: flex;
    position: absolute;
    bottom: -1rem;
    z-index: 1;
    color:white;
    background: black;
    left: 1REM;
    transform: translateY(100%);
}
.counter
{
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: white;
  padding: 0.5rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}
.image-filters
{
  background: #fafafa;
  display: flex;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 2rem;
  .filter
  {
    label
    {
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: block;
    }

  }
}
.no-images
{
  text-align: center;
  font-size: 1.5rem;
  color:white;
}
.image-viewer
{
  height: 100%;
  position: relative;
}
.image
{
  height: 100%;
  &.active
  {
    position: relative;
    z-index: 1;
  }
  position: absolute;
  left: 0;
  bottom: 0;
}
img
{
  width: 100%;
  transition:all 0.25s;
  height: 100%;
  object-fit: contain;
  background: black;
  display: block;
}



</style>
