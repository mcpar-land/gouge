"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var command_1 = require("../command");
describe('convert interaction to handler', function () {
    var cmd = command_1.command('foo', 'foo cmd')
        .integer('foo1', 'First foo arg', true, undefined)
        .integer('foo2', 'Second foo arg')
        .integer('foo3', 'Third foo arg')
        .boolean('foo4', 'Fourth foo arg');
    test('all args', function () {
        var i = {
            data: {
                name: 'foo',
                options: [
                    {
                        name: 'foo1',
                        value: 69,
                    },
                    {
                        name: 'foo2',
                        value: 69,
                    },
                    {
                        name: 'foo3',
                        value: 69,
                    },
                    {
                        name: 'foo4',
                        value: true,
                    },
                ],
            },
        };
        var args = [69, 69, 69, true];
        expect(cmd.convertInteractionToArgs(i)).toEqual(args);
    });
    test('only required args', function () {
        var i = {
            data: {
                name: 'foo',
                options: [
                    {
                        name: 'foo1',
                        value: 69,
                    },
                ],
            },
        };
        var args = [69, undefined, undefined, undefined];
        expect(cmd.convertInteractionToArgs(i)).toEqual(args);
    });
    test('missing tailing args', function () {
        var i = {
            data: {
                name: 'foo',
                options: [
                    {
                        name: 'foo1',
                        value: 69,
                    },
                    {
                        name: 'foo2',
                        value: 69,
                    },
                ],
            },
        };
        var args = [69, 69, undefined, undefined];
        expect(cmd.convertInteractionToArgs(i)).toEqual(args);
    });
    test('missing center args', function () {
        var i = {
            data: {
                name: 'foo',
                options: [
                    {
                        name: 'foo1',
                        value: 69,
                    },
                    {
                        name: 'foo4',
                        value: true,
                    },
                ],
            },
        };
        var args = [69, undefined, undefined, true];
        expect(cmd.convertInteractionToArgs(i)).toEqual(args);
    });
    test('missing center and tailing', function () {
        var i = {
            data: {
                name: 'foo',
                options: [
                    {
                        name: 'foo1',
                        value: 69,
                    },
                    {
                        name: 'foo3',
                        value: 69,
                    },
                ],
            },
        };
        var args = [69, undefined, 69, undefined];
        expect(cmd.convertInteractionToArgs(i)).toEqual(args);
    });
});
