import * as process from "process"
import { EOL } from "os"
import { test, TestContext, Context } from "ava"
import TapReporter = require("../src/reporter")

interface ReporterContext {
    reporter?: TapReporter
}

type ReporterTestContext = TestContext & Context<ReporterContext>

const baseReporter: any = {
    stats : {
        _duration : 10
    }
}

function createSuite (event: string, num: number, parentUid?: string) {
    const name = `suite ${num}`
    return {
        event,
        cid : "test",
        uid: name,
        parentUid: parentUid || name,
        title: name,
        parent: parentUid || name
    }
}

function createTest (event: string, num: number, state: string, parentUid?: string, err?: any) {
    const name = `test ${num}`
    return {
        type: event,
        event,
        cid: "test",
        uid: name,
        parentUid: parentUid || name,
        title: name,
        parent: parentUid || name,
        state,
        pending : state === "pending",
        err,
        duration: 10,
        file: "fake.specs.js"
    }
}

class StdoutStub {
    public static data: string[] = []

    public static _write: typeof process.stdout.write = null

    public static stub (): void {
        StdoutStub._write = process.stdout.write

        process.stdout.write = (buffer: string) => {
            if (buffer !== EOL) {
                StdoutStub.data.push(buffer)
            }
            return true
        }
    }

    public static restore (): void {
        StdoutStub.data = []
        if (!StdoutStub._write) {
            return
        }
        process.stdout.write = StdoutStub._write
    }
}

test.beforeEach((t: ReporterTestContext) => {
    t.context = t.context || {}
    t.context.reporter = new TapReporter(baseReporter, {})
    StdoutStub.stub()
})

test.afterEach.always(() => {
    StdoutStub.restore()
})

test("should output header for TAP 13 protocol", (t: ReporterTestContext) => {
    const { reporter } = t.context
    reporter.emit("start")
    const [output] = StdoutStub.data
    t.is(output, "TAP version 13")
})

test("should output plan summary when no tests were run", (t: ReporterTestContext) => {
    const { reporter } = t.context
    reporter.emit("end")
    const [output] = StdoutStub.data
    t.is(output, "1..0 # SKIP No tests present")
})

test("should output plan summary when tests were run", (t: ReporterTestContext) => {
    const { reporter } = t.context

    reporter["results"].tests = 2
    reporter["results"].pass = 1
    reporter["results"].skip = 1
    reporter["results"].fail = 1

    reporter.emit("end")

    const expect: string = [
        "1..3",
        "# tests 3",
        "# pass 1",
        "# skip 1",
        "# fail 1",
        "# Finished in 10ms"
    ].join(EOL)

    const [output] = StdoutStub.data
    t.is(output, expect)
})

test("should add new test suites to registered ones", (t: ReporterTestContext) => {
    const { reporter } = t.context

    const event: string = "suite:start"
    const suite1 = createSuite(event, 1)
    const suite2 = createSuite(event, 2, suite1.uid)

    t.is(reporter["suites"].length, 0)
    reporter.emit(event, suite1)
    t.is(reporter["suites"].length, 1)
    t.deepEqual(reporter["suites"][0], suite1)
    reporter.emit(event, suite2)
    t.is(reporter["suites"].length, 2)
    t.deepEqual(reporter["suites"][1], suite2)
})

test("should increment tests counter when new test is started", (t: ReporterTestContext) => {
    const { reporter } = t.context

    t.is(reporter["results"].tests, 0)
    reporter.emit("test:start")
    t.is(reporter["results"].tests, 1)
    for (let i = 1; i <= 5; i++) {
        reporter.emit("test:start")
    }
    t.is(reporter["results"].tests, 6)
})

test("should increment done tests counter if test finishes with any correct state", (t: ReporterTestContext) => {
    const { reporter } = t.context
    const test1 = createTest("test:fake", 1, "pass")

    t.is(reporter["results"].done, 0)

    reporter.emit("test:pass", test1)
    reporter.emit("test:fail", test1)
    reporter.emit("test:pending", test1)

    t.is(reporter["results"].done, 3)
})

test("should terminate tests when test has incorrect state", (t: ReporterTestContext) => {
    const { reporter } = t.context
    const event: string = "fake"
    const test1 = createTest(event, 1, "foo")

    reporter.emit("test:pass", test1)

    const expect: string = [
        "# [Runner: test] test 1",
        "Bail out! Test 1 has incorrect state and could not be processed",
    ].join(EOL)

    const [output] = StdoutStub.data
    t.is(output, expect)
})

test("should output chunk for passed test and increment passed counter", (t: ReporterTestContext) => {
    const { reporter } = t.context
    const event: string = "test:pass"
    const test1 = createTest(event, 1, "pass")

    t.is(reporter["results"].pass, 0)

    reporter.emit(event, test1)

    const expect: string = [
        "# [Runner: test] test 1",
        "ok 1 - test 1"
    ].join(EOL)

    const [output] = StdoutStub.data
    t.is(output, expect)
    t.is(reporter["results"].pass, 1)
})

test("should output chunk for skipped test and increment skipped counter", (t: ReporterTestContext) => {
    const { reporter } = t.context
    const event: string = "test:pending"
    const test1 = createTest(event, 1, "pending")

    t.is(reporter["results"].skip, 0)

    reporter.emit(event, test1)

    const expect: string = [
        "# [Runner: test] test 1",
        "ok 1 - test 1 # SKIP Test skipped"
    ].join(EOL)

    const [output] = StdoutStub.data
    t.is(output, expect)
    t.is(reporter["results"].skip, 1)
})

test("should output chunk for failed test end increment failed counter", (t: ReporterTestContext) => {
    const { reporter } = t.context
    const event: string = "test:fail"
    const test1 = createTest(event, 1, "fail", null)
    const test2 = createTest(event, 2, "fail", null, { message : "Foo Bar" })
    const test3 = createTest(event, 3, "fail", null, { type : "Exception" })
    const test4 = createTest(event, 4, "fail", null, { stack : "Foo Bar" })

    t.is(reporter["results"].fail, 0)

    reporter.emit("test:fail", test1)
    reporter.emit("test:fail", test2)
    reporter.emit("test:fail", test3)
    reporter.emit("test:fail", test4)

    const [expect1, expect2, expect3, expect4] = [test1, test2, test3, test4].map((_test: any, i: number) => {
        const error = _test.err || {}
        return [
            `# [Runner: test] ${_test.title}`,
            `not ok ${i + 1} - ${_test.title}`,
            "# Diagnostics",
            "  ---",
            `  message: ${error.message || "Test failed without message"}`,
            "  severity: fail",
            "  data:",
            `    file: ${_test.file}`,
            error.type ? `    type: ${error.type}` : null,
            error.stack ? `    stack: ${error.stack}` : null,
            "  ..."
        ].filter((i: string) => i !== null).join(EOL)
    })

    const [output1, output2, output3, output4] = StdoutStub.data
    t.is(output1, expect1)
    t.is(output2, expect2)
    t.is(output3, expect3)
    t.is(output4, expect4)
    t.is(reporter["results"].fail, 4)
})

test("should correctly output test nested in suites", (t: ReporterTestContext) => {
    const { reporter } = t.context

    const event: string = "test:pass"
    const suite1 = createSuite(event, 1)
    const suite2 = createSuite(event, 2, suite1.title)
    const test1 = createTest(event, 1, "pass", suite2.title)
    const test2 = createTest(event, 2, "pass", "fake")

    reporter.emit("suite:start", suite1)
    reporter.emit("suite:start", suite2)
    reporter.emit(event, test1)
    reporter.emit(event, test2)

    const expect1: string = [
        "# [Runner: test] suite 1 › suite 2 › test 1",
        "ok 1 - suite 1 › suite 2 › test 1"
    ].join(EOL)

    const expect2: string = [
        "# [Runner: test] test 2",
        "ok 2 - test 2"
    ].join(EOL)

    const [output1, output2] = StdoutStub.data
    t.is(output1, expect1)
    t.is(output2, expect2)
})
