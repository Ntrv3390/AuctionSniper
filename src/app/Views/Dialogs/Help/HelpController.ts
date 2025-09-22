import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelpViewModel } from './HelpViewModel';
import { HelpTopic } from 'src/app/models/help-topic.enum';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpController implements OnInit {
  @Input() data!: HelpTopic; // Replaces getData() from BaseDialogController

  viewModel: HelpViewModel = {
    topic: undefined as any // no default, matches old controller
  };

  constructor(private modalCtrl: ModalController) {}

  /** Equivalent to dialog_shown() in old controller */
  ngOnInit(): void {
    this.dialog_shown();
  }

  /** Migration of dialog_shown() */
  protected dialog_shown(): void {
    // In the old controller:
    // super.dialog_shown();
    // this.viewModel.topic = this.getData();
    this.viewModel.topic = this.data;
  }

  /** Migration of close_click() */
  protected close_click(): void {
    this.close();
  }

  /** Replacement for BaseDialogController.close() */
  close(): void {
    this.modalCtrl.dismiss();
  }
}
