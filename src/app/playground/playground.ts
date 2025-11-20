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
  youtubeId = '8h7rriQD1qc'; //'FwmAxDejyNo'; //'dQw4w9WgXcQ'; // example id or bind to a signal/property
  videoDuration: number | null = null; // Store video duration
  counter = signal(0);
  inputValue: string = '';
  inputNumber: number = 0;
  inputSignal = signal(this.inputNumber);
  sliderValue = signal(0); // Add this signal for the slider
  // sliderVal = 0;
  // @ViewChild('myPlayer', { static: false }) iframe: ElementRef | undefined;
  videoTitle = '';
  videoCurrentTime: number = 0;
  player: any = null;
  selectedOption = '5 seconds';
  lengthOption = 0.1;
  jumpLength = 1;

  duration = 0;
  currentTime = 0;
  private updateInterval: number | null = null;
  // output signals
  parentMessage = signal<string>('Awaiting message...');
  newTime = signal<number>(0);
  evKey = signal<KeyboardEvent | null>(null);

  // handling child events
  handleChildMessage(message: string): void {
    console.log('handleChildMessage message=', message);
    this.parentMessage.set(message);
    console.log('Parent received this value:', message);
  }
  handleUpdatedTime(time: number): void {
    console.log('handleUpdatedTime time=', time);
    this.newTime.set(time);
    console.log('Parent received updated time:', time);
  }
  handleKeydownEvent(event: KeyboardEvent): void {
    console.log('handleKeydownEvent event=', event);
    this.evKey.set(event);

    if (event.key.toLowerCase() === 'h') {
      console.log('H key pressed - toggling play/pause');
      this.togglePlayPause();
      // this.seekBy(this.jumpLength);
    }
    if (event.key === 'ArrowRight') {
      console.log('right arrow key pressed -');
      // this.togglePlayPause();
      this.seekBy(this.jumpLength);
    }
    console.log('Parent received keydown event:', event);
  }

  private togglePlayPause() {
    if (!this.player) return;
    try {
      const state = this.player.getPlayerState();
      // YT.PlayerState.PLAYING === 1
      if (state === 1) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    } catch {
      // fallback: call playVideo
      this.player.playVideo?.();
    }
    this.newTime.set(this.player.getCurrentTime());
    this.sliderValue.set(this.newTime());
  }

  private seekBy(delta: number) {
    if (!this.player || typeof this.player.getCurrentTime !== 'function') return;
    const now = this.player.getCurrentTime();
    const newTime = Math.max(0, Math.min(this.duration || 0, now + delta));
    this.player.seekTo(newTime, true);
    this.currentTime = newTime;
    this.player.pauseVideo();
    // ÷this.updatedTime.emit(this.player.getCurrentTime());
  }

  private startUpdating() {
    // this.stopUpdating();
    this.updateInterval = window.setInterval(() => {
      if (this.player?.getCurrentTime) {
        this.currentTime = this.player.getCurrentTime();
      }
      // refresh duration if available later
      if (this.player?.getDuration) {
        const d = this.player.getDuration();
        if (d && d !== this.duration) this.duration = d;
      }
    }, 150);
  }

  //////// end handling child events

  constructor() {
    console.log('playground constructor', this.parentMessage());
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
    this.startUpdating();

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
      this.player = player;
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
    this.newTime.set(this.inputNumber);

    // this.videoCurrentTime = event.target.getCurrentTime() || 0;
  }

  onValueChange(value: number) {
    console.log('Input value changed:', value);
    this.inputNumber = value;
    this.inputSignal.set(value);
    this.sliderValue.set(value); // Convert to match slider scale
    this.player.pauseVideo();
    this.player.seekTo(this.inputNumber, true);
    this.newTime.set(this.inputNumber);
    this.sliderValue.set(this.newTime()); // Convert to match slider scale

    // this.sliderValue.set(value * 1000); // Convert to match slider scale
  }

  onSliderChange(event: any) {
    console.log('Slider value changed:', event);
    this.sliderValue.set(event.value);
    this.inputNumber = event;
    this.inputNumber = event;
    this.player.seekTo(this.inputNumber, true);
    this.newTime.set(this.inputNumber);

    // this.inputSignal.set(event / 1000);
    // this.inputSignal.set(event / 1000);
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
      // return Math.round(value / 10) + 'k';
    }
    console.log('val===', `${value}`);
    return `${value}`;
  }

  onSetStart() {
    this.counter.update((count) => this.inputNumber);
    this.newTime.set(this.inputNumber);

    // console.log('zuul', this.youtubePlayer);

    // alert('Button clicked!');
  }

  onButtonClick() {
    this.counter.update((count) => count + 1);
    // alert('Button clicked!');
  }
}
