import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatdataService {

  constructor() { }

  private inputData :string=''

  setInputData(data:string):void{
    // console.log('this.inputData111',this.inputData);
    
    this.inputData=data
  }
  getInputData(): string {
    // console.log('this.inputData:22222',this.inputData);
    
    return this.inputData;
  }
}
