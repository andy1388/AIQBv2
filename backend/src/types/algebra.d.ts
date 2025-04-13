declare module 'algebrite' {
    namespace algebrite {
        function expand(expr: string): { toString(): string };
        function factor(expr: string): { toString(): string };
    }
    export = algebrite;
}

declare module 'nerdamer' {
    namespace nerdamer {
        interface NerdamerResult {
            toString(): string;
        }

        function solve(expr: string, variable?: string): NerdamerResult;
        function expand(expr: string): NerdamerResult;
        function factor(expr: string): NerdamerResult;
    }

    function nerdamer(expr: string): nerdamer.NerdamerResult;
    namespace nerdamer {
        export { nerdamer as default };
    }
    export = nerdamer;
}

declare module 'nerdamer/all' {
    export {};
} 