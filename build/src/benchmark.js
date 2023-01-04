#!/usr/bin/env node
import b from "benny";
import os from "os";
import id128 from "id128";
import { createId } from "@paralleldrive/cuid2";
import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import { uuidv7 } from "@kripod/uuidv7";
import cuid from "cuid";
import { nanoid } from "nanoid";
import xid from "xid-js";
import KSUID from "ksuid";
import packageJson from "../package.json" assert { type: "json" };
const { UlidMonotonic } = id128;
function platform(logger) {
    logger.info("Platform info:");
    logger.info("==============");
    logger.info("  ", os.type() + " " + os.release() + " " + os.arch());
    logger.info("  ", "Node.JS:", process.versions.node);
    logger.info("  ", "V8:", process.versions.v8);
    let cpus = os
        .cpus()
        .map(function (cpu) {
        return cpu.model;
    })
        .reduce(function (o, model) {
        if (!o[model])
            o[model] = 0;
        o[model]++;
        return o;
    }, {});
    cpus = Object.keys(cpus)
        .map(function (key) {
        return key + " \u00d7 " + cpus[key];
    })
        .join("\n");
    logger.info("  ", "CPU:", cpus);
    logger.info("  ", "Memory:", (os.totalmem() / 1024 / 1024 / 1024).toFixed(0), "GB");
}
platform(console);
b.suite("GUID Benchmark", b.add("uuid v1", () => {
    uuidv1();
}), b.add("uuid v4", () => {
    uuidv4();
}), b.add("uuid v7", () => {
    uuidv7();
}), b.add("nanoid", () => {
    nanoid();
}), b.add("cuid", () => {
    cuid();
}), b.add("cuid2", () => {
    createId();
}), b.add("ulid (monotonic)", () => {
    UlidMonotonic.generate();
}), b.add("xid", () => {
    xid.next();
}), b.add("ksuid", () => {
    KSUID.randomSync();
}), b.cycle(), b.complete(), b.save({
    file: "benchmark",
    folder: "..",
    format: "csv",
    version: packageJson.version,
}), b.save({
    file: "benchmark",
    folder: "..",
    version: packageJson.version,
    format: "chart.html",
}));
//# sourceMappingURL=benchmark.js.map