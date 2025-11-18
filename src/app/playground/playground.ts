import { CommonModule } from '@angular/common';
import { Component, ViewChild, signal, effect, model, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { YoutubeEmbed } from '../youtube-embed/youtube-embed';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
// import { VideoPlayer } from '../video-player/video-player';
// comments

@Component({
  selector: 'app-playground',
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    YoutubeEmbed,
    // VideoPlayer,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './playground.html',
  styleUrl: './playground.css',
})
export class Playground {
  // @ViewChild(YoutubeEmbed) youtubePlayer!: YoutubeEmbed;
  @ViewChild('parentContainer')
  parentElement!: ElementRef<HTMLDivElement>;
  youtubeId = 'FwmAxDejyNo'; //'dQw4w9WgXcQ'; // example id or bind to a signal/property
  videoDuration: number | null = null; // Store video duration
  counter = signal(0);
  inputValue: string = '';
  inputNumber: number = 0;
  inputSignal = signal(this.inputNumber);
  sliderValue = signal(0); // Add this signal for the slider
  // @ViewChild('myPlayer', { static: false }) iframe: ElementRef | undefined;
  videoTitle = '';
  videoCurrentTime: number = 0;

  selectedOption = '5 seconds';
  lengthOption = 0.1;

  constructor() {
    this.inputSignal.set(this.inputNumber);
    effect(() => {
      this.inputSignal.update((value) => value + this.inputNumber);
      console.log(`The count is: ${this.counter()}`);
      console.log(`The input is: ${this.inputSignal()}`);
    });
    // effect(() =>
  }

  selectedItem = model<number | null>(null);

  // We can still have a change function, but it just sets
  // the local model signal.
  onSelectionChange(value: number) {
    this.selectedItem.set(value);
  }

  onOptionChange(value: string) {
    // keep it simple — ngModel already updated selectedOption

    console.log('playground selectedOption =', value);
    this.lengthOption = Number(value);
    // this.lengthOption.toFixed(1)
    // you can also set signals or propagate elsewhere here
  }
  // ngAfterViewInit() {
  //   // You can access the iframe's native element here
  //   const iframeElement: HTMLIFrameElement = this.iframe?.nativeElement!;
  //   console.log('Iframe element:', iframeElement);
  // }

  // onIframeLoad() {
  //   // This method is called when the iframe's content has loaded
  //   const iframeElement: HTMLIFrameElement = this.iframe?.nativeElement;
  //   try {
  //     const iframeWindow = iframeElement.contentWindow;
  //     const iframeDocument = iframeElement.contentDocument || iframeWindow?.document;

  //     // Now you can access elements or properties within the iframe
  //     console.log('Iframe content document:', iframeDocument);
  //     // Example: Accessing an element by ID within the iframe
  //     // const someElement = iframeDocument.getElementById('someIdInsideIframe');
  //   } catch (e) {
  //     console.error('Error accessing iframe content:', e);
  //     // This typically occurs due to the Same-Origin Policy
  //   }
  // }

  onFocusRequested() {
    console.log('Parent: Received focus request. Focusing container...');
    if (this.parentElement) {
      this.parentElement.nativeElement.focus();
    }
  }

  onParentFocus() {
    console.log('Parent: I am focused!');
  }
  onPlayerReady(event: any) {
    console.log('Player Ready:', event);

    // Get the duration when the player is ready.
    // The YouTube Player API exposes getDuration() on the player instance (event.target).
    // Depending on the runtime/types available it may be synchronous (number) or
    // a Promise-like value in some wrappers — handle both safely and avoid TS errors
    // by narrowing/casting the type here.
    try {
      const player = event?.target as unknown as YT.Player | undefined;
      if (!player) {
        console.warn('No player instance available on event.target', event);
        return;
      }
      // get video title
      this.videoTitle = player.getVideoData().title || '';
      this.videoCurrentTime = player.getCurrentTime() || 0;

      // Treat the return value as unknown so we can narrow safely.
      const maybeDuration: unknown = (player as any).getDuration();

      const isPromise = (v: unknown): v is Promise<number> => {
        return !!v && typeof (v as any).then === 'function';
      };

      if (isPromise(maybeDuration)) {
        maybeDuration
          .then((duration: number) => {
            this.videoDuration = duration;
            console.log('Video Duration:', this.videoDuration);
          })
          .catch((err) => console.error('Error reading duration promise', err));
      } else {
        // Synchronous number return (typical for YT.Player.getDuration())
        this.videoDuration = (maybeDuration as number) ?? null;
        console.log('Video Duration:', this.videoDuration);
      }
    } catch (err) {
      console.error('Error getting duration', err);
    }
  }
  onPlayerStateChange(event: any) {
    console.log('Player State Changed:', event.data);
  }

  onValueChange(value: number) {
    console.log('Input value changed:', value);
    this.inputNumber = value;
    this.inputSignal.set(value);
    this.sliderValue.set(value * 1000); // Convert to match slider scale
  }

  onSliderChange(event: any) {
    console.log('Slider value changed:', event);
    this.sliderValue.set(event.value);
    this.inputNumber = event / 1000;
    this.inputSignal.set(event / 1000);
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    console.log('val===', `${value}`);
    return `${value}`;
  }

  onSetStart() {
    this.counter.update((count) => this.inputNumber);
    // console.log('zuul', this.youtubePlayer);

    // alert('Button clicked!');
  }

  onButtonClick() {
    this.counter.update((count) => count + 1);
    // alert('Button clicked!');
  }
}
