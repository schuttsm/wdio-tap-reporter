import { EventEmitter } from "events"
import { EOL } from "os"
import * as process from "process"

interface WDIORunner {
    browserName: string
}

interface WDIOReporterRun {
    capabilities: any[]
    config: {}
}

interface WDIOReporterSuite {
    title: string
    parent: string
    fullTitle: string
    pending: false
    file: string
    cid: string
    specs: string[]
    event: string
    runner: { [cid: string]: WDIORunner }
    uid: string
    parentUid: string
    specHash: string
}

interface WDIOReporterTest {

}

interface WDIOReporterHook {

}

function registerSuite () {

}

class TapReporter extends EventEmitter {

    private baseReporter;

    private config;

    private options;

    private suites: WDIOReporterSuite[] = []

    private pass: number = 0
    private skip: number = 0
    private fail: number = 0
    private tests: number = 0

    constructor (baseReporter, config, options = {}) {
        super()

        this.baseReporter = baseReporter
        this.config = config
        this.options = options

        this.suites = []

        this.on("start", (run: WDIOReporterRun) => {
            TapReporter.println("TAP version 13")
        })

        this.on("suite:start", (suite: WDIOReporterSuite) => {
            this.suites = this.suites.concat([suite])
        })

        /*
        this.on("hook:start", (a, b, c) => {
            console.warn("hook:start", a, b, c)
        })

        this.on("hook:end", (a, b, c) => {
            console.warn("hook:end", a, b, c)
        })
        */

        this.on("test:start", (test: WDIOReporterTest) => {
            this.tests += 1
            //console.warn("test:start", test)
        })

        this.on("test:end", (test: WDIOReporterTest) => {
            this.pass += 1
            //console.warn("test:end", test)
        })

        this.on("test:fail", (test: WDIOReporterTest) => {
            this.fail += 1
            //console.warn("test:fail", test)
        })

        this.on("test:pending", (test: WDIOReporterTest) => {
            this.skip += 1
            //console.warn("test:pending", test)
        })

        this.on("suite:end", (suite: WDIOReporterSuite) => {
            //console.warn("suite:end", suite)
        })

        this.on("end", (run: WDIOReporterRun) => {
            TapReporter.println(`1..${this.tests}`)
            TapReporter.println(`# tests ${this.tests}`)
            TapReporter.println(`# pass ${this.pass}`)
            TapReporter.println(`# skip ${this.skip}`)
            TapReporter.println(`# fail ${this.fail}`)
        })
    }

    public static println (message: string): void {
        process.stdout.write(`${message}${EOL}`)
    }

}

export = TapReporter
