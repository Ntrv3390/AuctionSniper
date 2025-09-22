import { Directive, HostListener, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appSelectOnClick]'
})
export class SelectOnClickDirective {

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @HostListener('click')
  onClick(): void {
    const input = this.el.nativeElement;

    if (isPlatformBrowser(this.platformId)) {
      const userAgent = window.navigator.userAgent;

      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const isAndroidChrome = /Android/.test(userAgent) && /Chrome/.test(userAgent);

      if (isIOS) {
        input.setSelectionRange(0, input.value.length);
      } else if (isAndroidChrome || input.select) {
        input.select();
      }
    }
  }
}
