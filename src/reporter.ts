import { EventEmitter } from "events"
import { EOL } from "os"
import * as process from "process"

// This interfaces are used only internally and don't reflect whole data shape

interface WDIOError {
    type?: string
    message?: string
    stack?: string
}

interface WDIOBase {
    type: string
    event: string
    cid: string
    uid: string
    parentUid: string
    specHash?: string
    specs?: string[]
}

interface WDIOResultBase extends WDIOBase {
    title: string
    pending: boolean
    file: string
}

type WDIOReporterSuite = WDIOResultBase

interface WDIOReporterTest extends WDIOResultBase {
    err?: WDIOError
}

interface Results {
    pass: number
    skip: number
    fail: number
    tests: number
    done: number
}

class TapReporter extends EventEmitter {

    public static out (chunk: string): void {
        process.stdout.write(chunk)
        process.stdout.write(EOL)
    }

    protected baseReporter: any
    protected config: any
    protected options: any
    protected suites: WDIOReporterSuite[] = []
    protected results: Results

    constructor (baseReporter: any, config: any, options?: any) {
        super()

        this.baseReporter = baseReporter
        this.config = config
        this.options = options
        this.results = {
            pass   : 0,
            skip   : 0,
            fail   : 0,
            tests  : 0,
            done   : 0
        }

        this.on("start", () => TapReporter.out("TAP version 13"))
        this.on("suite:start", (suite: WDIOReporterSuite) => this.suites.push(suite))
        this.on("test:start", () => this.results.tests++)
        this.on("test:pass", this.onTestResult)
        this.on("test:fail", this.onTestResult)
        this.on("test:pending", this.onTestResult)

        this.on("end", () => {
            const {
                fail,
                pass,
                skip,
                tests
            } = this.results
            const { _duration : duration } = this.baseReporter.stats
            const total: number = tests + skip

            if (total === 0) {
                TapReporter.out("1..0 # SKIP No tests present")
            }

            const lines: string[] = [
                `1..${total}`,
                `# tests ${total}`,
                `# pass ${pass}`,
                `# skip ${skip}`,
                `# fail ${fail}`,
                `# Finished in ${duration}ms`
            ]

            TapReporter.out(lines.join(EOL))
        })
    }

    protected getTestPath (test: WDIOReporterTest): string {
        if (test.uid === test.parentUid) {
            return test.title
        }

        const parents: string[] = []
        const path: string[] = [test.title]
        let parentUid = test.parentUid

        while (parentUid !== null) {
            const parent: WDIOReporterSuite = this.suites.find((suite: WDIOReporterSuite) => suite.uid === parentUid)

            if (parent) {
                parents.push(parent.uid)
                path.push(parent.title)
                parentUid = parent.parentUid
            } else {
                parentUid = null
            }

            // To prevent infinite loop
            if (parents.indexOf(parentUid) !== -1) {
                parentUid = null
            }
        }

        return path.reverse().join(" \u203A ")
    }

    private onTestResult = (test: WDIOReporterTest) => {
        this.results.done++

        const testTitle: string = this.getTestPath(test)
        const description: string = `# [Runner: ${test.cid}] ${testTitle}`
        const lines: string[] = [description]
        const { done } = this.results

        switch (test.type) {
            case "test:pass":
            case "test:pending":
                if (test.pending) {
                    this.results.skip++
                } else {
                    this.results.pass++
                }

                const directive: string = test.pending ? " # SKIP Test skipped" : ""
                lines.push(`ok ${done} - ${testTitle}${directive}`)
                break

            case "test:fail":
                this.results.fail++
                const error: WDIOError = test.err || {}

                lines.push(`not ok ${done} - ${testTitle}`)
                lines.push("# Diagnostics")
                lines.push("  ---")
                lines.push(`  message: ${error.message || "Test failed without message"}`)
                lines.push("  severity: fail")
                lines.push("  data:")
                lines.push(`    file: ${test.file}`)
                if (error.type) {
                    lines.push(`    type: ${error.type}`)
                }
                if (error.stack) {
                    lines.push(`    stack: ${error.stack}`)
                }
                lines.push("  ...")
                break

            default:
                lines.push(`Bail out! Test ${done} has incorrect state and could not be processed`)
        }

        TapReporter.out(lines.join(EOL))
    }

}

export = TapReporter
