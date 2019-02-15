import {properties} from "./options.bytes.json";
function isEmpty(obj){
    if(typeof obj == "undefined" || obj == null || obj == ""){
        return true;
    }else{
        return false;
    }
}
export default function(params,options){
    for(var o in options){
        let so = properties[o];
        let oo = options[o];
        if(!so){
            continue;
        }
        if(so.type=="boolean"){
            if(oo==true||(so.default&&oo==so.default)){
                params.push("--"+o);
            }
        }
        if(so.type=="string"){
            if(isEmpty(oo)||(so.default&&oo==so.default)){
                continue;
            }
            params.push("--"+o);
            params.push(oo);
        }
        if(so.type=="number"){
            if(oo==0||(so.default&&oo==so.default)){
                continue;
            }
            params.push("--"+o);
            params.push(oo);
        }
    }
}
