![stealing ur feelings](https://github.com/noahlevenson/stealing-ur-feelings/blob/master/tech-demo-07112018.gif)

### STEALING UR FEELINGS

*Stealing Ur Feelings* is a web-based interactive documentary that reveals how Snapchat can use your face to secretly collect data about your emotions. It's being produced with the support of a $50,000 grant from the NetGain partnership -- a collaboration between Mozilla, MacArthur Foundation, Ford Foundation, Knight Foundation and the Open Society Foundations. 

Using a combination of filmed content, augmented reality and game mechanics, the film will explore the wild science of machine learning-based facial feature tracking, demystify the algorithms that determine if you're happy or sad, and show you how corporations can correlate your emotions with the content you consume to do some Not Very Nice Things.

We're gonna have a slapping soundtrack, too.

*Stealing Ur Feelings* began life as an application for Mozilla's 2018 [awards for art and advocacy exploring artificial intelligence](https://blog.mozilla.org/blog/2018/06/04/mozilla-announces-225000-for-art-and-advocacy-exploring-artificial-intelligence/). **This repository is an open workspace.** Check back often for updates!
<br/><br/>

#### :eyes: check these out first 
* [interactive tech demo](https://noahlevenson.github.io/stealing-ur-feelings/tech-demo/) (requires a computer with a webcam) :arrow_left: :arrow_left: :arrow_left:
* [wireframe mockups](https://noahlevenson.github.io/stealing-ur-feelings/media/wireframes_07112018.pdf)
* [initial funding concept](https://github.com/noahlevenson/stealing-ur-feelings/blob/master/media/initial-funding-concept.md)
* [full application](https://github.com/noahlevenson/stealing-ur-feelings/blob/master/media/full-application.md)
* [slides from the 10/24/2018 Pecha Kucha talk at London's Royal Society of Arts](https://docs.google.com/presentation/d/e/2PACX-1vSGp751HRvqRZc-oWQM_JA9mb0IfSe8w2bBLbMmNi3-fb2gRVuUeyUqYsko0Gatd53z2BETPx-63Ybk/pub?start=false&loop=false&delayms=20000)
* film script (coming soon)
<br/><br/>

#### :zap: changelog
**10/24/2018** We won 

**07/12/2018** Submitted full application to Mozilla

**07/08/2018** The interactive tech demo is live!

**07/06/2018** Registered domain name: *stealingurfeelin.gs*

**06/29/2018** Original funding concept accepted by Mozilla - we've been invited to submit a full application! 
<br/><br/>

#### :muscle: challenges + approach
A project like *Stealing Ur Feelings* presents a unique set of creative and engineering challenges. This section describes our solutions and techniques.


**Facial landmark detection and emotion recognition**

To create our Snapchat-style AR filter and perform emotion recognition in the browser, we'll need to implement [Constrained Local Models](http://ci2cv.net/media/papers/2011_IJCV_Saragih.pdf), a recent breakthrough in the field of machine learning-based computer vision. Though we may ultimately write our own implementation (as we've done previously with the [Viola-Jones framework](https://github.com/noahlevenson/wasmface)), there are some open source libraries that seem very promising. Two of the most popular such libraries are [clmtrackr](https://github.com/auduno/clmtrackr) and [Dlib](http://dlib.net/). We used clmtrackr for our [interactive tech demo](https://noahlevenson.github.io/stealing-ur-feelings/tech-demo/) and the results were excellent.


**Frame-accurate video sync**

The web video API has no method to accurately return the current frame position of a video element, which makes it difficult to create synchronized keyframe events. Mathematical solutions exist, but they desynchronize due to floating point rounding errors. Instead, we'll use the optical framecode system developed for our previous interactive film, *[Weird Box](https://www.fastcompany.com/40434842/your-instagram-photos-star-in-this-funny-and-creepy-short-film)*. For this method, we actually embed tiny barcode-like images in our video which contain the binary representation of each frame number.


**Production value**

We like shooting CinemaDNG Raw with [Blackmagic](https://www.blackmagicdesign.com/) cameras and vintage Nikon lenses. We record our location audio with the industry standard [Sennheiser MKH-416](https://www.bhphotovideo.com/c/product/79502-REG/Sennheiser_MKH416_P48U3_MKH_416_Short_Shotgun.html).
<br/><br/>

#### :construction: engineering hit list
run a Dlib wasm experiment

reduce framecode bit depth to 16 bits

~~make framecode system use typedarrays instead of hacky integer bit parsing~~

try functional keyframe events system?

make everything go full screen and responsive

mobile benchmarking and optimization
<br/><br/>

#### :pencil: todo
~~submit initial funding concept~~ 

~~create wireframe mockups~~

~~make a tech demo~~

~~submit full grant application~~

write/finalize film script

~~domain name exploration + registration~~

film shoot

film edit

film optical framecode pipeline

frontend design

frontend development

produce AR filter gfx assets

user testing, feedback + iteration

produce final film titles + gfx assets

film VO record/final audio mix

film final color grade

film final conform

user acceptance testing

release strategy/marketing/festival + awards submissions

