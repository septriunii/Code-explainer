import { PresetExample } from './types';

export const PRESETS: PresetExample[] = [
  {
    id: 'binary-search',
    title: 'Binary Search',
    language: 'python',
    description: 'Finds the index of target 7 in a sorted 6-element list in logarithmic time.',
    sourceCode: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        guess = arr[mid]
        if guess == target:
            return mid
        elif guess < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

numbers = [1, 3, 5, 7, 9, 11]
result = binary_search(numbers, 7)
print(f"Found at index: {result}")`,
    trace: [
      { line: 15, variables: { numbers: [1, 3, 5, 7, 9, 11] }, output: '' },
      { line: 16, variables: { numbers: [1, 3, 5, 7, 9, 11] }, output: '' },
      { line: 1, variables: { numbers: [1, 3, 5, 7, 9, 11], arr: [1, 3, 5, 7, 9, 11], target: 7 }, output: '' },
      { line: 2, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0 }, output: '' },
      { line: 3, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5 }, output: '' },
      { line: 4, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5 }, output: '' },
      { line: 5, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5, mid: 2 }, output: '' },
      { line: 6, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5, mid: 2, guess: 5 }, output: '' },
      { line: 7, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5, mid: 2, guess: 5 }, output: '' },
      { line: 9, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5, mid: 2, guess: 5 }, output: '' },
      { line: 10, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 5, mid: 2, guess: 5 }, output: '' },
      { line: 4, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 5 }, output: '' },
      { line: 5, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 5, mid: 4 }, output: '' },
      { line: 6, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 5, mid: 4, guess: 9 }, output: '' },
      { line: 7, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 5, mid: 4, guess: 9 }, output: '' },
      { line: 9, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 5, mid: 4, guess: 9 }, output: '' },
      { line: 12, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 3, mid: 4, guess: 9 }, output: '' },
      { line: 4, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 3 }, output: '' },
      { line: 5, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 3, mid: 3 }, output: '' },
      { line: 6, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 3, mid: 3, guess: 7 }, output: '' },
      { line: 7, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 3, mid: 3, guess: 7 }, output: '' },
      { line: 8, variables: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 3, high: 3, mid: 3, guess: 7 }, output: '' },
      { line: 16, variables: { numbers: [1, 3, 5, 7, 9, 11], result: 3 }, output: '' },
      { line: 17, variables: { numbers: [1, 3, 5, 7, 9, 11], result: 3 }, output: 'Found at index: 3\n' }
    ],
    cachedAnnotations: {
      lines: [
        { line: 1, explanation: 'Defines the binary search function taking a list and target value.' },
        { line: 2, explanation: 'Initializes the search boundary to the start of the array.' },
        { line: 3, explanation: 'Sets the upper search boundary to the final index.' },
        { line: 4, explanation: 'Loops while the search window contains at least one candidate.' },
        { line: 5, explanation: 'Calculates the midpoint index of the current search window.' },
        { line: 6, explanation: 'Reads the array element at the midpoint index.' },
        { line: 7, explanation: 'Checks if the middle element matches the search target.' },
        { line: 8, explanation: 'Returns the matching index when the target is located.' },
        { line: 9, explanation: 'Checks whether the middle value is smaller than the target.' },
        { line: 10, explanation: 'Shifts the lower boundary to narrow the search to the right half.' },
        { line: 12, explanation: 'Shifts the upper boundary to narrow the search to the left half.' },
        { line: 13, explanation: 'Returns -1 when the target is not present in the array.' },
        { line: 15, explanation: 'Defines the sorted list of numbers to be searched.' },
        {
          line: 16,
          explanation: 'Executes binary search on numbers for target value 7.',
          arguments: [
            { name: 'numbers', meaning: 'the sorted array of integers to search' },
            { name: '7', meaning: 'the target integer value sought' }
          ]
        },
        { line: 17, explanation: 'Prints the resulting found index to standard output.' }
      ],
      variables: [
        { name: 'numbers', role: 'Stores the input sorted array of integers.' },
        { name: 'result', role: 'Stores the returned index of the search result.' },
        { name: 'arr', role: 'Refers to the sequence of elements being inspected.' },
        { name: 'target', role: 'Represents the integer value sought in the array.' },
        { name: 'low', role: 'Tracks the lower index boundary of the active search window.' },
        { name: 'high', role: 'Tracks the upper index boundary of the active search window.' },
        { name: 'mid', role: 'Holds the calculated midpoint index of the current window.' },
        { name: 'guess', role: 'Holds the value read from the array at the midpoint.' }
      ],
      step_notes: [
        { line: 10, note: 'Lower pointer shifted to 3 after middle value 5 proved smaller than target 7.' },
        { line: 12, note: 'Upper pointer reduced to 3 after middle value 9 exceeded target 7.' },
        { line: 8, note: 'Midpoint value 7 exactly matches target; returning index 3.' }
      ]
    }
  },
  {
    id: 'two-sum',
    title: 'Two Sum (Hash Map)',
    language: 'javascript',
    description: 'Finds two numbers in an array that add up to a target using a dictionary in O(n) time.',
    sourceCode: `function twoSum(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in seen) {
            return [seen[complement], i];
        }
        seen[nums[i]] = i;
    }
    return [];
}

const input = [2, 7, 11, 15];
const indices = twoSum(input, 9);
console.log("Indices:", indices);`,
    trace: [
      { line: 13, variables: { input: [2, 7, 11, 15] }, output: '' },
      { line: 14, variables: { input: [2, 7, 11, 15] }, output: '' },
      { line: 1, variables: { input: [2, 7, 11, 15], nums: [2, 7, 11, 15], target: 9 }, output: '' },
      { line: 2, variables: { nums: [2, 7, 11, 15], target: 9, seen: {} }, output: '' },
      { line: 3, variables: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0 }, output: '' },
      { line: 4, variables: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, complement: 7 }, output: '' },
      { line: 5, variables: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, complement: 7 }, output: '' },
      { line: 8, variables: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 0, complement: 7 }, output: '' },
      { line: 3, variables: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1 }, output: '' },
      { line: 4, variables: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, complement: 2 }, output: '' },
      { line: 5, variables: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, complement: 2 }, output: '' },
      { line: 6, variables: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, complement: 2 }, output: '' },
      { line: 14, variables: { input: [2, 7, 11, 15], indices: [0, 1] }, output: '' },
      { line: 15, variables: { input: [2, 7, 11, 15], indices: [0, 1] }, output: 'Indices: [0, 1]\n' }
    ],
    cachedAnnotations: {
      lines: [
        { line: 1, explanation: 'Declares function finding indices of two elements adding to target.' },
        { line: 2, explanation: 'Initializes an empty hash table to map visited values to their indices.' },
        { line: 3, explanation: 'Iterates through each element in the input array by index.' },
        { line: 4, explanation: 'Calculates the difference between the target and the current element.' },
        { line: 5, explanation: 'Checks if the required complement exists in the hash table.' },
        { line: 6, explanation: 'Returns the pair of indices forming the target sum.' },
        { line: 8, explanation: 'Records the current element and its index in the hash table.' },
        { line: 10, explanation: 'Returns an empty array if no matching pair satisfies the sum.' },
        { line: 13, explanation: 'Defines the test array of integers.' },
        {
          line: 14,
          explanation: 'Invokes twoSum with input array and target value 9.',
          arguments: [
            { name: 'input', meaning: 'the integer array to evaluate' },
            { name: '9', meaning: 'the required sum of the two numbers' }
          ]
        },
        { line: 15, explanation: 'Outputs the pair of matching indices to the console.' }
      ],
      variables: [
        { name: 'input', role: 'Holds the initial array of numbers passed to the program.' },
        { name: 'indices', role: 'Holds the resulting two indices that sum to the target.' },
        { name: 'nums', role: 'References the array being traversed inside the function.' },
        { name: 'target', role: 'Specifies the desired sum for the two numbers.' },
        { name: 'seen', role: 'Maps previously seen numbers to their respective indices.' },
        { name: 'i', role: 'Maintains the current loop iteration index.' },
        { name: 'complement', role: 'Stores the counterpart value needed to reach the target sum.' }
      ],
      step_notes: [
        { line: 8, note: 'Saved number 2 at index 0 into seen map for future lookup.' },
        { line: 6, note: 'Complement 2 discovered in seen map; returning index pair [0, 1].' }
      ]
    }
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Two-Pointers',
    language: 'python',
    description: 'Verifies whether a string is a palindrome using inward-converging pointers.',
    sourceCode: `def is_palindrome(text):
    left = 0
    right = len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True

word = "radar"
valid = is_palindrome(word)
print(f"Is palindrome: {valid}")`,
    trace: [
      { line: 11, variables: { word: 'radar' }, output: '' },
      { line: 12, variables: { word: 'radar' }, output: '' },
      { line: 1, variables: { word: 'radar', text: 'radar' }, output: '' },
      { line: 2, variables: { text: 'radar', left: 0 }, output: '' },
      { line: 3, variables: { text: 'radar', left: 0, right: 4 }, output: '' },
      { line: 4, variables: { text: 'radar', left: 0, right: 4 }, output: '' },
      { line: 5, variables: { text: 'radar', left: 0, right: 4 }, output: '' },
      { line: 7, variables: { text: 'radar', left: 1, right: 4 }, output: '' },
      { line: 8, variables: { text: 'radar', left: 1, right: 3 }, output: '' },
      { line: 4, variables: { text: 'radar', left: 1, right: 3 }, output: '' },
      { line: 5, variables: { text: 'radar', left: 1, right: 3 }, output: '' },
      { line: 7, variables: { text: 'radar', left: 2, right: 3 }, output: '' },
      { line: 8, variables: { text: 'radar', left: 2, right: 2 }, output: '' },
      { line: 4, variables: { text: 'radar', left: 2, right: 2 }, output: '' },
      { line: 9, variables: { text: 'radar', left: 2, right: 2 }, output: '' },
      { line: 12, variables: { word: 'radar', valid: true }, output: '' },
      { line: 13, variables: { word: 'radar', valid: true }, output: 'Is palindrome: True\n' }
    ],
    cachedAnnotations: {
      lines: [
        { line: 1, explanation: 'Defines helper to check if text reads identically in reverse.' },
        { line: 2, explanation: 'Points left pointer to the first character of the string.' },
        { line: 3, explanation: 'Points right pointer to the last character of the string.' },
        { line: 4, explanation: 'Continues loop until both pointers meet or cross.' },
        { line: 5, explanation: 'Compares characters at current left and right indices.' },
        { line: 6, explanation: 'Returns False immediately if characters do not match.' },
        { line: 7, explanation: 'Advances left pointer toward the middle.' },
        { line: 8, explanation: 'Steps right pointer backward toward the middle.' },
        { line: 9, explanation: 'Returns True when all symmetrical pairs matched.' },
        { line: 11, explanation: 'Initializes the sample word string.' },
        { line: 12, explanation: 'Calls palindrome check with word radar.' },
        { line: 13, explanation: 'Displays verification result.' }
      ],
      variables: [
        { name: 'word', role: 'Stores the input string being checked.' },
        { name: 'valid', role: 'Holds the boolean result of the palindrome validation.' },
        { name: 'text', role: 'Represents the string parameter inside the function.' },
        { name: 'left', role: 'Tracks the advancing index from the start of the string.' },
        { name: 'right', role: 'Tracks the retreating index from the end of the string.' }
      ],
      step_notes: [
        { line: 5, note: 'Characters "r" and "r" match at extremities 0 and 4.' },
        { line: 8, note: 'Pointers meet at index 2 without any mismatched characters.' },
        { line: 9, note: 'All character pairs verified; string is confirmed as palindrome.' }
      ]
    }
  }
];
