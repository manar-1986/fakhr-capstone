import React from "react";
import { beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import Feed from "../app/(tabs)/community/index";
import Create from "../app/(tabs)/community/create";
import Details from "../app/(tabs)/community/post";
const mockPush = jest.fn(), mockPending = jest.fn(), mockMutate = jest.fn();
let mockUser: any = null, mockRTL = false;
const mockPost = { id: "test-post", title: "A parent's original words", content: "تجربة مكتوبة بالعربية", author: { name: "Test Parent" }, tags: ["autism"], likes: 2, commentCount: 0, isSaved: false, isLiked: false, isOwn: false, visibility: "public", createdAt: "2026-10-01T12:00:00Z", comments: [] };
let mockLatestQuery: any;
const mockRouter = { push: mockPush, replace: mockPush, canGoBack: () => false, back: jest.fn() };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => ({ id: "test-post" }) }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, loading: false }) }));
jest.mock("../utils/authRedirect", () => ({ setPendingAuthHref: (...args: unknown[]) => mockPending(...args) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, locale: mockRTL ? "ar" : "en", align: mockRTL ? "right" : "left", tabRow: mockRTL ? "row-reverse" : "row" }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: require("react-native").View, useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../api/community.api", () => ({ getCommunityPosts: jest.fn(), getCommunityPost: jest.fn(), createCommunityPost: jest.fn(), setCommunityInteraction: jest.fn(), commentOnCommunityPost: jest.fn(), reportCommunityPost: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: (options: any) => { mockLatestQuery = options; return { data: { pages: [{ posts: [mockPost] }] } }; },
  useQuery: ({ queryKey }: any) => ({ data: queryKey[1] === "post" ? mockPost : { posts: [] } }),
  useMutation: () => ({ mutate: mockMutate }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
beforeEach(() => { mockUser = null; mockRTL = false; mockPush.mockClear(); mockPending.mockClear(); mockMutate.mockClear(); });
test("guests browse posts and New Post preserves the composer auth return", () => {
  const screen = render(<Feed />);
  expect(screen.getByText(mockPost.title)).toBeTruthy();
  expect(mockPush).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText("New Post"));
  expect(mockPending).toHaveBeenCalledWith("/(tabs)/community/create");
  expect(mockPush).toHaveBeenCalledWith("/(auth)/login");
});
test("guest save and like require login; saved feed cannot expose another account's data", () => {
  const screen = render(<Feed />);
  fireEvent.press(screen.getByLabelText("Like"));
  expect(mockMutate).not.toHaveBeenCalled();
  expect(mockPending).toHaveBeenCalledWith("/(tabs)/community/post?id=test-post");
  fireEvent.press(screen.getByText("Saved"));
  expect(mockPending).toHaveBeenCalledWith("/(tabs)/community?sort=saved");
});
test("category changes feed query and post opens details", () => {
  const screen = render(<Feed />);
  fireEvent.press(screen.getAllByText("Autism")[0]);
  expect(mockLatestQuery.queryKey).toContain("autism");
  fireEvent.press(screen.getByLabelText(mockPost.title));
  expect(mockPush).toHaveBeenCalledWith("/(tabs)/community/post?id=test-post");
});
test("Arabic UI preserves the original language of user-generated text", () => {
  mockRTL = true;
  const screen = render(<Feed />);
  expect(screen.getByText("مجتمع فخر")).toBeTruthy();
  expect(screen.getByText(mockPost.title)).toBeTruthy();
  expect(screen.getByText(mockPost.content)).toBeTruthy();
  expect(screen.queryByText(/@/)).toBeNull();
});
test("authenticated feed actions submit mutations", () => {
  mockUser = { id: "parent" };
  const screen = render(<Feed />);
  fireEvent.press(screen.getByLabelText("Like"));
  expect(mockMutate).toHaveBeenCalledWith({ post: mockPost, action: "like" });
  fireEvent.press(screen.getByLabelText("Save post"));
  expect(mockMutate).toHaveBeenCalledWith({ post: mockPost, action: "save" });
});
test("composer requires title and content but no diagnosis or child data", () => {
  mockUser = { id: "parent" };
  const screen = render(<Create />);
  fireEvent.press(screen.getByText("Publish Post"));
  expect(mockMutate).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByLabelText("Post title"), "My question");
  fireEvent.changeText(screen.getByLabelText("Post text"), "My experience");
  fireEvent.press(screen.getByText("Publish Post"));
  expect(mockMutate).toHaveBeenCalled();
});
test("authenticated details provide comment and report forms", () => {
  mockUser = { id: "parent" };
  const screen = render(<Details />);
  fireEvent.changeText(screen.getByLabelText("Add a comment"), "A reply");
  fireEvent.press(screen.getByText("Post Comment"));
  expect(mockMutate).toHaveBeenCalled();
  fireEvent.press(screen.getByText("Report inappropriate content"));
  fireEvent.changeText(screen.getByLabelText("Report reason"), "Test reason");
  fireEvent.press(screen.getByText("Submit Report"));
  expect(mockMutate).toHaveBeenCalledTimes(2);
});
