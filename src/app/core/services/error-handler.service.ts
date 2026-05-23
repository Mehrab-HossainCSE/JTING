import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private toastr = inject(ToastrService);

  handleErrorWithToster(error: any): void {
    if (error) {
      console.log('err', error);
      
      if (
        error.error &&
        error.error.ValidationErrors &&
        error.error.ValidationErrors.length > 0
      ) {
        this.toastr.error(error.error.ValidationErrors[0].ErrorMessage, 'Error');
      } 
      else if (error.ValidationErrors && error.ValidationErrors.length > 0) {
        this.toastr.error(error.ValidationErrors[0].ErrorMessage, 'Error');
      } 
      // Catches standard .NET Core validation dictionary errors
      else if (error.error && error.error.errors) {
        const firstKey = Object.keys(error.error.errors)[0];
        this.toastr.error(error.error.errors[firstKey][0], 'Error');
      } 
      else if (error.error && error.error.Errors) {
        this.toastr.error(error.error.Errors, 'Error');
      } 
      else if (error.error && error.error.message) {
        this.toastr.error(error.error.message, 'Error');
      } 
      else {
        this.toastr.error('An unknown error occurred.', 'Error');
      }
    } else {
      this.toastr.error('An unknown error occurred.', 'Error');
    }
  }
}