"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
var fs = require("fs");
var path = require("path");
function getAllFiles(dirPath, arrayOfFiles) {
    if (arrayOfFiles === void 0) { arrayOfFiles = []; }
    var files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
        var filePath = path.join(dirPath, file).replaceAll("\\", "/");
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        }
        else {
            arrayOfFiles.push(filePath);
        }
    });
    return arrayOfFiles;
}
var ignoreFolders = ["node_modules", "public"]; // Tambahkan folder yang ingin diabaikan
var hooks = getAllFiles("./src/hooks").map(function (x) { return x.split("src/")[1]; });
var components = getAllFiles("./src/components")
    .filter(function (x) { return !ignoreFolders.some(function (igf) { return x.includes(igf); }); }) // Menggunakan `includes` agar lebih fleksibel
    .map(function (x) { return x.split("src/")[1]; });
exports.ui = [
    {
        name: "shadcn-sidebar",
        type: "registry:block",
        registryDependencies: [
            "avatar",
            "button",
            "card",
            "collapsible",
            "dropdown-menu",
            "scroll-area",
            "sheet",
            "tooltip",
        ],
        dependencies: ["immer", "zustand", "next-themes"],
        tailwind: {
            config: {
                theme: {
                    extend: {
                        keyframes: {
                            "accordion-down": {
                                from: { height: "0" },
                                to: { height: "var(--radix-accordion-content-height)" },
                            },
                            "accordion-up": {
                                from: { height: "var(--radix-accordion-content-height)" },
                                to: { height: "0" },
                            },
                            "collapsible-down": {
                                from: { height: "0" },
                                to: { height: "var(--radix-collapsible-content-height)" },
                            },
                            "collapsible-up": {
                                from: { height: "var(--radix-collapsible-content-height)" },
                                to: { height: "0" },
                            },
                        },
                        animation: {
                            "accordion-down": "accordion-down 0.2s ease-out",
                            "accordion-up": "accordion-up 0.2s ease-out",
                            "collapsible-down": "collapsible-down 0.2s ease-out",
                            "collapsible-up": "collapsible-up 0.2s ease-out",
                        },
                    },
                },
            },
        },
        files: __spreadArray(__spreadArray(__spreadArray([], hooks, true), components, true), ["lib/menu-list.ts"], false),
    },
];
