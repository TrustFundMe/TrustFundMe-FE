# Hướng dẫn về Quy hoạch động (Dynamic Programming) trong dự án TrustFundMe

Tài liệu này giải thích cách thuật toán Quy hoạch động (DP) được áp dụng thực tế trong tính năng **Gợi ý vật phẩm khi quyên góp** (Donation Suggestions) của dự án.

---

## 1. Bài toán thực tế
Khi một nhà hảo tâm nhập số tiền quyên góp $A$, hệ thống cần tìm các tổ hợp vật phẩm (mì tôm, sữa, gạo...) sao cho tổng giá trị của chúng xấp xỉ hoặc bằng đúng $A$.

Đây là biến thể của **Bài toán Cái túi (Bounded Knapsack)**, nhưng thay vì tối ưu hóa giá trị, chúng ta tìm kiếm các tổ hợp khả thi nhất để gợi ý cho người dùng.

---

## 2. Công thức Truy hồi (Recurrence Relation)

Trong dự án này, chúng ta không dùng khái niệm "trọng lượng". Thuật toán vận hành dựa trên **Tiền**, **Vật phẩm** và **Số lượng**.

### Công thức tổng quát:
Gọi $DP[i][b]$ là tập hợp các tổ hợp vật phẩm đạt được tổng giá trị đúng bằng $b$ khi xét đến loại vật phẩm thứ $i$.

$$DP[i][nb] = DP[i-1][b] \cup \{ \text{tổ hợp cũ } b + q \text{ cái vật phẩm } i \}$$

### Công thức trên mảng 2 chiều:
Gọi $DP[i][j]$ là tập hợp các cách kết hợp vật phẩm đạt được tổng số tiền $j$ khi xét đến vật phẩm thứ $i$.

$$dp[i][j] = \underbrace{dp[i-1][j]}_{\text{Các cách KHÔNG dùng vật phẩm } i} \cup \underbrace{\left\{ (dp[i-1][j - q \times P_i] + q \times \text{Item}_i) \right\}}_{\text{Các cách CÓ dùng } q \text{ vật phẩm } i}$$

**Trong đó:**
*   $i$: Chỉ số của vật phẩm đang xét (dòng).
*   $j$: Số tiền mục tiêu đang tính (cột).
*   $P_i$: Giá tiền của vật phẩm $i$.
*   $q$: Số lượng vật phẩm $i$ lấy thêm vào ($1 \leq q \leq \text{Số lượng tồn kho}$).

**Ý nghĩa:** Kết quả của mức tiền lớn ($j$) được xây dựng bằng cách lấy kết quả của mức tiền nhỏ hơn ($j - q \times P_i$) đã tính trước đó và cộng thêm một số lượng vật phẩm mới.

### 3. Cấu trúc dữ liệu "Danh sách các tổ hợp" lưu trữ như thế nào?

Nếu trong bài toán trên lớp, ô $dp[i][j]$ thường chỉ lưu một số nguyên (`int`) (ví dụ lưu số `5` ý nói có 5 cách). 
Nhưng trong web thực tế của bạn, hệ thống cần **biết chính xác từng cách đó là mua những gì** để hiển thị lên màn hình. Do đó, ô $dp[i][j]$ phải lưu trữ một **Danh sách các tổ hợp (List of Objects)**.

Trong mã nguồn TypeScript (`src/utils/dpSuggestion.ts`), danh sách này được tối ưu dưới dạng `Map`:

```typescript
const dp: Map<number, Map<string, Record<string, number>>>[] = [];
```

#### Từng lớp của mảng DP này chứa gì?

1.  **Dòng ($i$) - `[]`**: Là mảng ngoài cùng, tượng trưng cho từng loại vật phẩm.
2.  **Cột ($j$) - `Map<number, ...>`**: Là số tiền. Thay vì dùng mảng dài 200.000 phần tử trống rỗng, ta dùng `Map` chỉ để lưu những mức tiền tạo ra được tổ hợp (VD: 10k, 20k).
3.  **Bên trong ô $dp[i][j]$ - `Map<string, Record<string, number>>`**: Đây chính là "Danh sách các tổ hợp". 
    *   Mỗi một **cách quyên góp** là một Object (`Record<string, number>`). Trong đó: **Key** là ID món hàng, **Value** là số lượng.
    *   Để gom các cách này lại thành một danh sách không bị trùng, ta dùng cấu trúc `Map`. Key của Map là một chuỗi gộp tên (như `"Mì tôm×2|Sữa×1"`), Value của Map là bản thân cái Object đó.

#### Ví dụ cụ thể:

Khi bạn gõ lệnh lấy dữ liệu tại ô **`dp[2].get(40000)`** (tức là: Cho tôi xin các cách để mua hết 40.000đ khi có Mì và Sữa), thứ mà máy tính trả về sẽ là một **Danh sách 3 Objects** được lưu dưới dạng Map như sau:

```javascript
// Cấu trúc: Map.set( KEY, VALUE )
Map(3) {
  // Cách 1: 4 thùng mì
  "Mì tôm×4" => { 
      "id_145": 4 
  },
  
  // Cách 2: 2 thùng mì + 1 lốc sữa
  "Mì tôm×2|Sữa×1" => { 
      "id_145": 2, 
      "id_201": 1 
  },
  
  // Cách 3: 2 lốc sữa
  "Sữa×2" => { 
      "id_201": 2 
  }
}
```

**Sự liên kết giữa Thuật toán và Frontend:**
Cấu trúc trên gồm 2 phần được tách biệt vai trò rõ ràng:
*   **KEY (`"Mì tôm×2|Sữa×1"`)**: Cái nhãn dán chỉ dùng để **Khử trùng lặp** lúc chạy bằng thuật toán. Nếu tìm ra thêm một con đường khác cũng ra 2 mì 1 sữa, nó sẽ tự đè lên key này. Người dùng sẽ không bao giờ nhìn thấy 2 gợi ý giống hệt nhau.
*   **VALUE (`{ "id_145": 2, "id_201": 1 }`)**: Là Dữ liệu gốc chứa ID thực tế. Thuật toán sau cùng sẽ ném Key đi và gửi mảng Value này về Frontend.

**Ví dụ Code xử lý trên Frontend khi người dùng bấm chọn:**
Khi Frontend nhận được dữ liệu, nó sẽ quét qua Value này để bỏ vật phẩm vào giỏ hàng (`State`). Dưới đây là cách mà mã nguồn Frontend (`src/app/donation/page.tsx`) sử dụng các ID đó:

```typescript
// Khi người dùng bấm nút "Chọn gợi ý này" trên giao diện
const handleApplySuggestion = (option: SuggestionOption) => {
    // Tạo lại cái giỏ hàng trên giao diện bằng đúng ID thực tế
    const newItems: Record<string, number> = {};
    
    option.items.forEach((item) => {
        // item.id ở đây chính là "id_145" hoặc "id_201" lấy từ phần VALUE
        // item.quantity chính là số lượng 2 hoặc 1 tương ứng
        newItems[item.id] = item.quantity; 
    });
    
    // Đẩy vào Object giỏ hàng chung của React
    setItems(newItems); 
    setAmount(option.total); // Cập nhật lại tổng tiền hiển thị
};
```
Như vậy, nhờ sử dụng `item.id`, Frontend có thể gửi chính xác cho Backend biết nhà hảo tâm chuẩn bị thanh toán những món gì mà không cần quan tâm đến cái chuỗi String phức tạp kia nữa!

---

## 3. Phân tích Code thực tế (`src/utils/dpSuggestion.ts`)

Đoạn mã dưới đây thực hiện việc "xây gạch" các mốc tiền từ thấp đến cao:

```typescript
// Duyệt qua từng loại vật phẩm (Mì, Sữa, Gạo...)
for (let i = 0; i < n; i++) {
    const item = eligible[i];
    const price = item.price;
    const maxQty = Math.min(item.quantityLeft, MAX_QTY_PER_ITEM, Math.floor(amount / price));

    // Duyệt qua các mốc tiền 'b' đã đạt được từ các vật phẩm trước
    for (let b = 0; b <= scaledAmount; b++) {
        const combosAtB = dp[i].get(b);
        if (!combosAtB) continue;

        // Thử thêm vật phẩm hiện tại với số lượng 'q'
        for (let q = 1; q <= maxQty; q++) {
            const nb = b + (q * price); // TỔNG TIỀN MỚI
            if (nb <= scaledAmount) {
                // Tạo tổ hợp mới dựa trên tổ hợp cũ tại mốc 'b'
                const newQtyMap = { ...baseQtyMap };
                newQtyMap[item.id] = (baseQtyMap[item.id] || 0) + q;
                
                // Lưu vào bảng DP cho mốc tiền 'nb'
                dp[i + 1].set(nb, newQtyMap);
            }
        }
    }
}
```

### Mô phỏng mảng 2 chiều trong bộ nhớ

Giả sử: **Mì tôm (10k)** là vật phẩm mã A ($i=1$), **Sữa (20k)** là vật phẩm mã B ($i=2$). Ngân sách **40k**.

| dp[i][j] | j = 0 | j = 10k | j = 20k | j = 30k | j = 40k |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **i = 0 (Gốc)** | `{Ø}` | `null` | `null` | `null` | `null` |
| **i = 1 (Mì)** | `{Ø}` | **dp[0][0]+1A** | **dp[0][0]+2A** | **dp[0][0]+3A** | **dp[0][0]+4A** |
| **i = 2 (Sữa)** | `{Ø}` | `dp[1][10]` | **dp[1][20] ∪ (dp[1][0]+1B)** | **dp[1][30] ∪ (dp[1][10]+1B)** | **dp[1][40] ∪ (dp[1][20]+1B) ∪ (dp[1][0]+2B)** |

### Giải thích chi tiết cách tính:

*   **Tại ô `dp[2][30k]`**: AI muốn tính các cách đạt 30k khi xét thêm Sữa (20k):
    1.  **Nhìn lên trên**: `dp[1][30k]` $\rightarrow$ Thấy cách cũ là `{3 Mì}`.
    2.  **Nhìn lùi về sau** (cột [30k - 20k] = 10k): Thấy `dp[1][10k]` có `{1 Mì}`. Nó cộng thêm 1 Sữa vào $\rightarrow$ `{1 Mì, 1 Sữa}`.
    3.  **Hợp lại**: `dp[2][30k] = { {3A}, {1A, 1B} }`.

*   **Tại ô `dp[2][40k]`**: AI muốn tính các cách đạt 40k:
    1.  **Nhìn lên trên**: `dp[1][40k]` $\rightarrow$ Thấy `{4 Mì}`.
    2.  **Nhìn lùi lại 1 Sữa (cột 20k)**: Thấy `dp[1][20k]` có `{2 Mì}`. Cộng thêm 1 Sữa $\rightarrow$ `{2 Mì, 1 Sữa}`.
    3.  **Nhìn lùi lại 2 Sữa (cột 0đ)**: Thấy `dp[1][0]` có `{Ø}`. Cộng thêm 2 Sữa $\rightarrow$ `{2 Sữa}`.
    4.  **Hợp lại**: `dp[2][40k] = { {4A}, {2A, 1B}, {2B} }`.

---

## 4. Ví dụ chạy thực tế (Dry Run)

**Giả sử:**
*   Ngân sách: **50.000đ**
*   Vật phẩm 1: **Mì tôm (10.000đ)**
*   Vật phẩm 2: **Sữa (20.000đ)**

### Bước 1: Xét Mì tôm (10k)
AI tính toán các mốc tiền có thể tạo ra từ Mì tôm bằng cách lấy các mốc tiền nhỏ hơn cộng dồn lên:
*   10k = {Mì: 1}
*   20k = {Mì: 2}
*   30k = {Mì: 3}
*   40k = {Mì: 4}
*   50k = {Mì: 5}

### Bước 2: Xét Sữa (20k)
AI lấy kết quả Bước 1 để "đối chiếu" và cộng thêm Sữa vào:
*   Lấy mốc **10k (1 Mì)** + 1 Sữa (20k) $\Rightarrow$ **30k**: {Mì: 1, Sữa: 1}
*   Lấy mốc **10k (1 Mì)** + 2 Sữa (40k) $\Rightarrow$ **50k**: {Mì: 1, Sữa: 2}
*   Lấy mốc **30k (3 Mì)** + 1 Sữa (20k) $\Rightarrow$ **50k**: {Mì: 3, Sữa: 1}

### Kết quả cuối cùng:
Tại mốc **50.000đ**, thuật toán trả về 3 gợi ý tiêu biểu nhất:
1.  **{Mì: 5}**
2.  **{Mì: 1, Sữa: 2}**
3.  **{Mì: 3, Sữa: 1}**

---

## 5. Giới hạn của thuật toán (Limitations)

Mặc dù Quy hoạch động giải quyết mượt mà bài toán, nhưng vì JavaScript chặn luồng giao diện (Single-thread), việc duyệt qua số lượng dữ liệu khổng lồ sẽ làm "đơ" Frontend. Vì vậy, trong `src/utils/dpSuggestion.ts` đã chủ động chặn các giới hạn sau để bảo vệ trình duyệt:

### 1. Giới hạn số tiền `MAX_SCALED_BUDGET = 2.000.000`
Nếu một nhà hảo tâm quyên góp 100 Triệu VNĐ, vòng lặp $j$ sẽ phải chạy 100.000.000 lần. Điều này sẽ lập tức gây tràn RAM trình duyệt. Code đã quy định: Dù bạn có nhập 100 Triệu, DP cũng chỉ chạy và rà soát tổ hợp trong quy mô **2 Triệu VNĐ** đổ lại để tính ranh giới tỷ lệ.

### 2. Giới hạn thời gian sống `Date.now() - start > 100` (100 mili-giây)
Khi có quá nhiều loại vật phẩm (vd 50 loại) với mệnh giá quá nhỏ, số lượng tổ hợp được sinh ra ($\cup$) có thể đạt mức hàng chục triệu cách. 
Code đã ngầm quy định: **Nếu thuật toán chạy quá 0.1 giây mà chưa tính xong, hãy lập tức ngưng lại!** DP sẽ lấy tạm kết quả của những món hàng đã quét để trả về, phần còn lại đi bằng thuật toán *Greedy* (Tham lam), đảm bảo người dùng bấm nút là ra số liền, không bao giờ thấy trang bị lag.

### 3. Số lượng mua tối đa cho 1 món: `MAX_QTY_PER_ITEM = 20`
Để tránh việc thuật toán đi mua "100 gói tăm" cho đủ số tiền 100k, biến `q` chỉ được phép chọn tối đa 20 vật phẩm cho cùng một mã hàng, ép buộc hệ thống phải đi tìm những giỏ hàng phân bổ đa dạng các loại hàng khác nhau.

---

## 6. Tại sao phải dùng Quy hoạch động?

1.  **Hiệu năng:** Nếu dùng đệ quy thông thường (Brute-force), với 50 loại vật phẩm, máy tính sẽ phải thử hàng tỷ tỷ tổ hợp, gây treo trình duyệt. DP giúp giải quyết trong **< 100ms**.
2.  **Đa dạng:** DP cho phép chúng ta tìm thấy **tất cả** các cách đạt được số tiền mục tiêu, từ đó AI có thể chọn ra những combo "tiết kiệm nhất" hoặc "đa dạng nhất" để gợi ý.
3.  **Chính xác:** Không có vật phẩm nào bị tính thừa hoặc vượt quá số lượng tồn kho nhờ vào việc kiểm soát trạng thái trong bảng DP.

---
*Tài liệu này được biên soạn để hỗ trợ đội ngũ phát triển TrustFundMe nắm vững logic cốt lõi của hệ thống gợi ý.*
