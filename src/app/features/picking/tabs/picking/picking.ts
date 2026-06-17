import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-picking-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './picking.html',
  styleUrl: './picking.scss'
})
export class Picking implements OnInit {
  ngOnInit(): void {}
}
