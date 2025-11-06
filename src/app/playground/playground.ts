import { CommonModule } from '@angular/common';
import { Component, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

// comments

@Component({
  selector: 'app-playground',
  imports: [CommonModule, FormsModule, MatSliderModule],
  templateUrl: './playground.html',
  styleUrl: './playground.css',
})
export class Playground {
  counter = signal(0);
  inputValue: string = '';
  inputNumber: number = 0;
  inputSignal = signal(this.inputNumber);
  sliderValue = signal(0); // Add this signal for the slider

  constructor() {
    this.inputSignal.set(this.inputNumber);
    effect(() => {
      this.inputSignal.update((value) => value + this.inputNumber);
      console.log(`The count is: ${this.counter()}`);
      console.log(`The count is: ${this.inputSignal()}`);
    });
    // effect(() => {
    //   this.inputSignal.update((value) => value + this.counter());
    //   console.log(`The count is: ${this.counter()}`);
    //   console.log(`The other is: ${this.inputSignal()}`);
    // });
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
    // alert('Button clicked!');
  }

  onButtonClick() {
    this.counter.update((count) => count + 1);
    // alert('Button clicked!');
  }
}
