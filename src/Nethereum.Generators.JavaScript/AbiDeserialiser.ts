﻿var n = require('./Nethereum.Generators.DuoCode.js');

var functionAbi = Nethereum.Generators.Model.FunctionABI;
var eventAbi = Nethereum.Generators.Model.EventABI;
var constructorAbi = Nethereum.Generators.Model.ConstructorABI;
var contractAbi = Nethereum.Generators.Model.ContractABI;
var parameterAbi = Nethereum.Generators.Model.ParameterABI;
var structAbi = Nethereum.Generators.Model.StructABI;


function buildConstructor(item: any): Nethereum.Generators.Model.ConstructorABI {
    var constructorItem = new constructorAbi();
    constructorItem.set_InputParameters(buildFunctionParameters(item.inputs));
    return constructorItem;
}

function buildFunction(item: any): Nethereum.Generators.Model.FunctionABI {
    var functionItem = new functionAbi(item.name, item.constant, false);
    functionItem.set_InputParameters(buildFunctionParameters(item.inputs));
    functionItem.set_OutputParameters(buildFunctionParameters(item.outputs));
    return functionItem;
}

function buildEvent(item: any): Nethereum.Generators.Model.EventABI {
    var eventItem = new eventAbi(item.name);
    eventItem.set_InputParameters(buildEventParameters(item.inputs));
    return eventItem;
}

function buildStructsFromParameters(items: any): Nethereum.Generators.Model.StructABI[] {
    var structs = [];
    for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].type.startsWith("tuple")) {
           structs = structs.concat(buildStructsFromTuple(items[i]));
        }
    }
    return structs;
}

function buildStructsFromTuple(item: any): Nethereum.Generators.Model.StructABI[] {
    var structs = [];
    var struct = new structAbi(item.name);
    var parameterOrder = 0;
    var parameters = [];
    for (var x = 0, len = item.components.length; x < len; x++) {
        var component = item.components[x];
        parameterOrder = parameterOrder + 1;
        if (component.type.startsWith("tuple")) {
            // simple hack until 0.5.8 type name is the same as the parameter name
            var parameter = new parameterAbi.ctor$1(component.type, component.name, parameterOrder, component.name);
            structs = structs.concat(buildStructsFromTuple(component));
        } else {
            var parameter = new parameterAbi.ctor$1(component.type, component.name, parameterOrder);
        }
        parameters.push(parameter);
    }
    struct.set_InputParameters(parameters);
    structs.push(struct);

    return structs;
}

function buildFunctionParameters(items: any): Nethereum.Generators.Model.ParameterABI[] {
    var parameterOrder = 0;
    var parameters = [];
    for (var i = 0, len = items.length; i < len; i++) {
        parameterOrder = parameterOrder + 1;
        if (items[i].type.startsWith("tuple")) {
            // simple hack until 0.5.8 type name is the same as the parameter name
            var parameter = new parameterAbi.ctor$1(items[i].type, items[i].name, parameterOrder, items[i].name);
        } else {
            var parameter = new parameterAbi.ctor$1(items[i].type, items[i].name, parameterOrder);
        }
        parameters.push(parameter);
    }
    return parameters;
}

function buildEventParameters(items: any): Nethereum.Generators.Model.ParameterABI[] {
    var parameterOrder = 0;
    var parameters = [];
    for (var i = 0, len = items.length; i < len; i++) {
        parameterOrder = parameterOrder + 1;
        if (items[i].type.startsWith("tuple")) {
            // simple hack until 0.5.8 type name is the same as the parameter name
            var parameter = new parameterAbi.ctor$1(items[i].type, items[i].name, parameterOrder, items[i].name);
        } else {
            var parameter = new parameterAbi.ctor$1(items[i].type, items[i].name, parameterOrder);
        }
        parameter.set_Indexed(items[i].indexed);
        parameters.push(parameter);
    }
    return parameters;
}

export function buildContract(abiStr: string): Nethereum.Generators.Model.ContractABI {
    const abi = JSON.parse(abiStr);
    let functions = [];
    let events = [];
    let structs :Nethereum.Generators.Model.StructABI[] = [];
    let constructor = new constructorAbi();

    for (var i = 0, len = abi.length; i < len; i++) {
        if (abi[i].type === "function") {
            functions.push(buildFunction(abi[i]));

            var temp = buildStructsFromParameters(abi[i].outputs);
            for (const item of temp) {
                if (!structs.some(x => x.get_Name() === item.get_Name())) {
                    structs.push(item);
                }
            }
        }

        if (abi[i].type === "event") {
            events.push(buildEvent(abi[i]));
        }

        if (abi[i].type === "constructor") {
            constructor = buildConstructor(abi[i]);
        }

        var temp = buildStructsFromParameters(abi[i].inputs);
        for (const item of temp) {
            if (!structs.some(x => x.get_Name() === item.get_Name())) {
                structs.push(item);
            }
        }
    }

    let contract = new contractAbi();
    contract.set_Constructor(constructor);
    contract.set_Functions(functions);
    contract.set_Events(events);
    contract.set_Structs(structs);
    return contract;
}   