declare module 'next/navigation' {
  export function useRouter(): {
    back: () => void;
    push: (url: string) => void;
    replace: (url: string) => void;
    refresh: () => void;
    prefetch: (url: string) => void;
  };

  export function useParams(): {
    [key: string]: string | string[] | undefined;
  };
}