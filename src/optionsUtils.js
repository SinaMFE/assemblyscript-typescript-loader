import schema from "./options.bytes.json";
function isEmpty(obj){
    if(typeof obj == "undefined" || obj == null || obj == ""){
        return true;
    }else{
        return false;
    }
}
export default function(params,options){
    for(var o in options){
        let so = schema[o];
        let oo = options[o];
        if(!so){
            continue;
        }
        if(so.type=="bool"){
            if(oo==true){
                params.push("--"+o);
            }
        }
        if(so.type=="string"){
            if(isEmpty(oo)){
                continue;
            }
            params.push("--"+o);
            params.push(oo);
        }
        if(so.type=="number"){
            if(oo==0){
                continue;
            }
            params.push("--"+o);
            params.push(oo);
        }
    }
}
