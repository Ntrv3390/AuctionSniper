import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-icon-panel',
  templateUrl: './icon-panel.component.html',
  styleUrls: ['./icon-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class IconPanelComponent implements OnInit, OnChanges {

  @Input() name: string = '';
  @Input() icon: string = '';
  @Input() iconSize: number = 24; // default size
  @Input() text: string = '';

  @Output() created = new EventEmitter<IconPanelComponent>();

  currentIcon: string = '';

  ngOnInit(): void {
    this.currentIcon = this.icon;
    this.created.emit(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['icon']) {
      this.currentIcon = this.icon;
    }
  }

  getName(): string {
    return this.name;
  }

  getIcon(): string {
    return this.currentIcon;
  }

  setIcon(icon: string): void {
    this.currentIcon = icon;
  }

  getIconSize(): number {
    return this.iconSize;
  }

  setIconSize(size: number): void {
    this.iconSize = size;
  }

  getText(): string {
    return this.text;
  }

  setText(text: string): void {
    this.text = text;
  }
}