import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  @Output() startData = new EventEmitter();
  gameForm: FormGroup;
  constructor() { }

  ngOnInit() {
    this.gameForm  = new FormGroup({
      borders: new FormControl(''),
      xSide: new FormControl('10'),
      ySide: new FormControl('10')
    });

    this.gameForm.patchValue({borders: 'no-borders', tc: true});
  }

  start($event: any) {
    $event.preventDefault();
    const x = this.gameForm.get('xSide').value;
    const y = this.gameForm.get('ySide').value;

    const borders = this.gameForm.get('borders').value;
    this.startData.emit({x, y, borders});
  }
}
