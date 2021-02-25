class Logger {
    private debugLevel: string;
    constructor(debugLevel:string) {
      this.debugLevel=debugLevel;
    }
    public debug(message:string){
     // tslint:disable-next-line:no-console
     console.log(this.debugLevel+" "+message);
    }
  }
  
  export default Logger;