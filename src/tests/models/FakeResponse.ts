export default class FakeResponse {
    public statusHandler: (code: number) => void = () => {}
    public jsonHandler: (body: any) => void = () => {}
    public endHandler: () => void = () => {}

    public status(code: number): FakeResponse {
        this.statusHandler(code)
        return this
    }

    public json(body: any): FakeResponse {
        this.jsonHandler(body)
        return this
    }

    public end(): FakeResponse {
        this.endHandler()
        return this
    }
}