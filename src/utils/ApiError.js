//took nodejs error class inheritance and modify some portion make own costructor

class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        //override fields
       super(message)
       this.statusCode=statusCode
       this.data= null,
       this.message=message
       this.success=false;
       this.errors=errors 
    

    // check if stack stack-trace

    if(stack){
        this.stack=stack
    }else{

        Error.captureStackTrace(this,this.constructor)
    }
}

}
export {ApiError}