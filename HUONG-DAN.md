# Hướng dẫn sử dụng Playwright QA Kit

Bản tiếng Anh: [GUIDE.md](GUIDE.md). Prompt mẫu giữ tiếng Anh để agent hiểu chính xác; agent sẽ trả lời bằng ngôn ngữ của bạn.

## Bước 1 — Cài hoặc nâng cấp skill

Mở terminal tại thư mục kit (thư mục có `install.py`):

```bash
python3 install.py --check
python3 install.py --project "/duong/dan/du-an" --agent all --dry-run
python3 install.py --project "/duong/dan/du-an" --agent all
```

`--check` kiểm tra kit có đủ và đồng bộ không. `--dry-run` chỉ in ra những gì sẽ copy. Thay `all` bằng `claude`, `cursor` hoặc `codex` nếu chỉ dùng một công cụ.

**Nâng cấp:** installer không ghi đè. Xoá thư mục skill cũ trong dự án trước rồi cài lại:

```bash
cd "/duong/dan/du-an"
rm -rf .claude/skills/pw-e2e-* .claude/skills/pw-ui-explore .agents/skills/pw-e2e-* .agents/skills/pw-ui-explore
```

Test, tài liệu trong `qa/` và project context của bạn không bị đụng tới.

## Bước 2 — Chuẩn bị dự án

Mở dự án trong Claude Code, Cursor hoặc Codex và **tạo chat mới** để skill được nạp. Agent cần:

- **File test case**: đường dẫn hoặc đính kèm. Định dạng nào cũng được; `templates/test-case.md` là tuỳ chọn.
- **Quyền đọc source** frontend và backend.
- **Môi trường test đang chạy**, tài khoản test cho từng role, và công cụ trình duyệt để agent thao tác UI.
- **Mật khẩu, token để trong biến môi trường**, không ghi vào tài liệu hay chat.
- **Playwright đã được cài trong dự án**. Kit không tự cài.

Tuỳ chọn: copy `templates/project-context.md` thành `qa/project-context.md` và điền những gì bạn biết (biến base URL, role, lệnh chạy, thư mục helper). Agent sẽ kiểm tra và bổ sung.

## Bước 3 — Chọn skill

| Bạn muốn | Skill | Dừng khi |
| --- | --- | --- |
| Viết test cho mọi case trong file, kèm case còn thiếu tìm được | `pw-e2e-cases` | Mọi case đã map, test đã chạy, runbook đã viết |
| Quét mọi nút, link, tab, dialog, route con của một màn hình và viết test theo từng vòng | `pw-e2e-screen` | Hết mỗi vòng, ở câu hỏi checkpoint |
| Tự bấm thử UI để viết thêm test case, không viết code | `pw-ui-explore` | Đã lưu báo cáo khám phá |
| Sửa hoặc giải thích test fail, test chập chờn | `pw-e2e-debug` | Đã xác định nguyên nhân, sửa nhỏ nhất và chạy lại |
| Review test hiện có, không sửa | `pw-e2e-review` | Đã báo lỗi kèm bằng chứng và bảng coverage |

Không cần gọi nối các skill. Ghi tên skill ở câu đầu tiên là đủ; cũng có thể gõ `/pw-e2e-screen` (Claude Code, Cursor) hoặc `$pw-e2e-screen` (Codex).

## Bước 4 — Checklist trước khi chạy

Chạy trong dự án cần test (không phải thư mục kit) trước khi dùng `pw-e2e-cases` hoặc `pw-e2e-screen`.

| # | Kiểm tra | Lệnh | Kết quả đúng |
| --- | --- | --- | --- |
| 1 | Đã cài skill | `ls .claude/skills .agents/skills` | Đủ 5 thư mục `pw-*` |
| 2 | Dự án có Playwright | `npx playwright --version` | In ra số phiên bản |
| 3 | Đã cài trình duyệt | `npx playwright install chromium` | Tải xong hoặc báo đã có |
| 4 | Config đọc được | `npx playwright test --list` | Không lỗi config (danh sách rỗng cũng được) |
| 5 | Môi trường test đang chạy | `curl -I "$BASE_URL"` (dùng biến của dự án bạn) | HTTP 200 hoặc 3xx |
| 6 | Có biến tài khoản (chỉ in tên) | `env \| grep -E "E2E_\|TEST_" \| cut -d= -f1` | Thấy tên các biến test cần |
| 7 | Git sạch | `git status --short` | Trống, để dễ xem agent đã sửa gì |

Kiểm tra bằng tay:

- [ ] Biết đường dẫn file case; với `pw-e2e-screen` cần thêm route của màn hình.
- [ ] Agent đọc được source frontend và backend.
- [ ] Agent có công cụ trình duyệt (không có thì agent chỉ dựa vào source và sẽ nói rõ).
- [ ] Đang dùng môi trường test, **không phải production**.
- [ ] Tuỳ chọn: có `qa/project-context.md` copy từ `templates/project-context.md`.
- [ ] Đã mở **chat mới** sau khi cài.

## Bước 5 — Tra cứu lệnh

### Cách gọi skill

| Công cụ | Cú pháp | Ví dụ |
| --- | --- | --- |
| Claude Code, Cursor | `/<skill> <yêu cầu>` | `/pw-e2e-screen Booking screen (entry route /bookings) …` |
| Codex | `$<skill> <yêu cầu>` | `$pw-e2e-screen Booking screen (entry route /bookings) …` |
| Mọi công cụ | Ghi tên skill ở câu đầu | `Use pw-e2e-screen on the Booking screen …` |

Ba cách cho kết quả như nhau. Viết yêu cầu ngay sau tên skill trong cùng một tin nhắn. Không ghi mật khẩu hay token vào prompt; chỉ ghi tên biến môi trường.

### `pw-e2e-cases` — viết test từ file case

| | |
| --- | --- |
| Bắt buộc | Đường dẫn file case; tên module hoặc màn hình |
| Tuỳ chọn | Đường dẫn source; role cần dùng; "chỉ làm BK-01, BK-03"; "không khám phá UI" |
| Agent có thể hỏi | Thiếu kết quả mong đợi, tài khoản hoặc giá trị môi trường làm case bị chặn |
| Bạn nhận | Test, runbook `qa/e2e/<module>.md`, bảng map mọi case và `DISC-N`, kết quả chạy |
| Bước tiếp | `pw-e2e-review` trên test vừa viết |

```text
/pw-e2e-cases every case in cases/booking.md for the Booking module.
```

```text
/pw-e2e-cases every case in cases/booking.md for the Booking module.
Read source at web/src/booking and api/src/booking. Roles: dispatcher (E2E_DISPATCHER_*).
Real test environment, no mocks. Keep unclear business behavior proposed and list the questions.
```

### `pw-e2e-screen` — quét một màn hình theo vòng

| | |
| --- | --- |
| Bắt buộc | Tên màn hình và route vào màn hình |
| Tuỳ chọn | File case; role; "không bấm <nút>"; route con bỏ qua |
| Agent sẽ hỏi | Câu hỏi checkpoint ở cuối mỗi vòng |
| Bạn nhận | Test, danh sách `qa/screens/<screen>.md` (`RT-N`, `EL-N`, màn liên kết, nhật ký vòng), runbook |
| Bước tiếp | Trả lời checkpoint; sau `Option 5` thì chạy `pw-e2e-review` |

```text
/pw-e2e-screen Booking screen (entry route /bookings). Cases are in cases/booking.md. Ask me before writing more.
```

```text
/pw-e2e-screen Booking screen (entry route /bookings). Cases are in cases/booking.md and cases/booking-detail.md.
Roles: dispatcher, manager. Do not click "Export CSV" or "Void". Ask me before writing more.
```

Trả lời checkpoint (gửi như tin nhắn bình thường, không cần dấu `/`):

| Trả lời | Ý nghĩa |
| --- | --- |
| `Option 1: EL-4, EL-6` | Viết test cho các phần tử này (phải đã rõ kết quả mong đợi) |
| `Option 2: added cases/booking-detail.md` | Đọc file mới và map ở vòng sau |
| `Option 3` | Kiểm tra truy cập cho phần tử an toàn chưa có test |
| `Option 4: Driver` | Quét màn Driver liên kết ở vòng sau |
| `Option 5` | Dừng và chốt tài liệu |

Làm tiếp hôm khác: gửi lại prompt đầu tiên trong chat mới, agent sẽ đọc `qa/screens/<screen>.md` và làm tiếp.

### `pw-ui-explore` — viết case mới từ UI, không viết code

| | |
| --- | --- |
| Bắt buộc | Tên màn hình hoặc tính năng |
| Tuỳ chọn | File case hiện có để so sánh; role; khu vực bỏ qua |
| Agent có thể hỏi | Đăng nhập hoặc role không vào được |
| Bạn nhận | `qa/discovery/<screen>.md` gồm case `DISC-N`, bằng chứng và câu hỏi nghiệp vụ |
| Bước tiếp | Trả lời câu hỏi, rồi chạy `pw-e2e-cases` với file đã chốt hoặc `Option 2` trong `pw-e2e-screen` |

```text
/pw-ui-explore Booking screen. Compare with cases/booking.md. Write missing cases with steps, actual result, and the question that needs a business answer. No test code.
```

### `pw-e2e-debug` — sửa hoặc giải thích test fail

| | |
| --- | --- |
| Bắt buộc | File test hoặc mã case |
| Tuỳ chọn | Log lỗi, trace hoặc đường dẫn report; "chỉ fail trên CI"; "fail 1/5 lần" |
| Agent có thể hỏi | Có được sửa code ứng dụng không (mặc định là không) |
| Bạn nhận | Nguyên nhân (test, ứng dụng, dữ liệu hay môi trường), bản sửa nhỏ nhất, kết quả chạy lại, cập nhật runbook nếu lệnh thay đổi |
| Bước tiếp | `pw-e2e-review` nếu bản sửa đụng tới helper dùng chung |

```text
/pw-e2e-debug BK-01 in tests/booking.spec.ts. Trace: test-results/booking-BK-01-chromium/trace.zip
```

### `pw-e2e-review` — review test, không sửa

| | |
| --- | --- |
| Bắt buộc | File test |
| Tuỳ chọn | File case để đối chiếu; "fix the findings" (chỉ khi đó mới sửa) |
| Bạn nhận | Lỗi kèm file và dòng, bảng map case với assertion, các lệnh đã chạy và kết quả |
| Bước tiếp | Tự sửa, hoặc gửi `pw-e2e-review … fix the findings` |

```text
/pw-e2e-review tests/booking.spec.ts against cases/booking.md. Do not edit files.
```

## Thứ tự chạy chuẩn

1. Bước 4: checklist trước khi chạy.
2. `/pw-e2e-cases` hoặc `/pw-e2e-screen`.
3. `/pw-e2e-review` trên test vừa viết.
4. `/pw-e2e-debug` khi có test fail hoặc chập chờn.

## Quy trình A — Viết test từ file case

```text
Use pw-e2e-cases on every case in <case file> for the <module> module.
Read source at <paths>. Real test environment, no mocks.
```

Agent làm: kiểm kê fixture và helper sẵn có → đọc mọi case → đọc source → lập bản đồ phụ thuộc → bấm thử UI tìm case thiếu (`DISC-N`) → viết test cho case `ready` → chạy → viết `qa/e2e/<module>.md`.

## Quy trình B — Quét một màn hình theo từng vòng

```text
Use pw-e2e-screen on the <screen> screen (entry route <route>).
Cases are in <case file>. Ask me before writing more.
```

Mỗi vòng:

1. **Lập danh sách** mọi route con (`RT-N`) và phần tử bấm được (`EL-N`) trong màn hình, từ source và UI thật, kèm mức rủi ro: `safe`, `mutating-owned`, `destructive`, `external`. Chỉ bấm phần tử `safe` và thao tác trên dữ liệu do test tạo.
2. **Nút dẫn sang màn khác**: bấm thử một lần để xem màn đích mở được, ghi lại các nút chính trên màn đó (chỉ đọc, không bấm).
3. **Map** từng phần tử với case. Phần tử chưa có case là `uncovered`.
4. **Viết và chạy test** cho case `ready`. Case có hành trình đi sang màn khác vẫn được test trọn vẹn.
5. **Lưu** `qa/screens/<screen>.md` và runbook.
6. **Checkpoint**: agent hỏi và chờ bạn trả lời.

Cách trả lời checkpoint:

| Lựa chọn | Ví dụ trả lời | Điều xảy ra tiếp theo |
| --- | --- | --- |
| Viết thêm test | `Option 1: EL-4, EL-6` | Viết test cho các phần tử đó nếu đã rõ kết quả mong đợi |
| Bổ sung file | `Option 2: added cases/booking-detail.md` | Vòng sau đọc file mới và map tiếp |
| Chỉ kiểm tra truy cập | `Option 3` | Test route con mở được, nút an toàn mở đúng đích; gắn nhãn `reachability` |
| Quét màn hình liên kết | `Option 4: Driver` | Quét màn Driver với file riêng `qa/screens/driver.md` |
| Dừng | `Option 5` | Chốt tài liệu, phần tử chưa có test được liệt kê kèm lý do |

Muốn làm tiếp hôm sau: gửi lại đúng yêu cầu trong chat mới. Agent đọc `qa/screens/<screen>.md` và làm tiếp từ checkpoint cuối, giữ nguyên ID.

Ví dụ Booking → View driver → Create driver: vòng 1 quét Booking, bấm thử "View driver" và ghi lại màn Driver có "Create driver", "Edit", "Deactivate". Checkpoint gợi ý quét Driver. Bạn chọn `Option 4: Driver` thì vòng sau mới làm việc với "Create driver".

## Quy trình C — Chưa có file case

1. **Khám phá**:
   ```text
   Use pw-ui-explore on the <screen> screen. Write the missing cases with steps,
   actual result, and the question that needs a business answer. No test code.
   ```
   Kết quả: `qa/discovery/<screen>.md` gồm các case `DISC-N`. Case chưa có kết quả mong đợi được xác nhận sẽ ở trạng thái `proposed`.
2. **Chốt kết quả**: trả lời từng câu hỏi trong file đó hoặc trong file case. Ghi kết quả mong đợi và nguồn (yêu cầu, ticket, hoặc quyết định của bạn).
3. **Tự động hoá**: chạy Quy trình A với file đã chốt, hoặc trả lời checkpoint của `pw-e2e-screen` bằng Option 2.

Agent không bao giờ tự lấy hành vi hiện tại của UI làm kết quả đúng. Bước 2 là quyết định của con người.

## Quy trình D — Debug hoặc review

```text
Use pw-e2e-debug on <test file or case ID>. Here is the failing output/trace: <path>.
```

```text
Use pw-e2e-review on <test files> against <case file>. Do not edit files.
```

Debug giữ nguyên assertion đang bắt được bug của app và báo cáo bug đó. Review chỉ báo lỗi có bằng chứng kèm file và dòng, không sửa file.

## Phụ thuộc giữa các module

Ví dụ Booking có thể phụ thuộc Driver, Vehicle, Rate. Agent xác minh quan hệ thật từ source và môi trường, lập bản đồ phụ thuộc, tạo dữ liệu do test sở hữu qua UI hoặc API thật được phép, và dọn theo thứ tự mới nhất trước. Bước nghiệp vụ đang được test luôn đi qua UI. Thiếu role, dịch vụ hay dữ liệu thì các case liên quan là `blocked` kèm điều kiện còn thiếu, các case độc lập vẫn làm tiếp.

**Không mock, stub, backend giả, HAR replay, sửa response hay chèn state.**

## Bạn nhận lại gì

| Kết quả | Ở đâu | Skill tạo |
| --- | --- | --- |
| Test Playwright | Thư mục test sẵn có của repo | cases, screen, debug |
| Runbook: map case, chuẩn bị, lệnh chạy từng case và cả module, kết quả chạy thật gần nhất | `qa/e2e/<module>.md` hoặc theo quy ước repo | cases, screen |
| Danh sách màn hình: `RT-N`, `EL-N`, màn liên kết, nhật ký vòng | `qa/screens/<screen>.md` | screen |
| Báo cáo khám phá: case `DISC-N` và câu hỏi | `qa/discovery/<feature>.md` | explore |
| Thông tin dự án và danh sách helper | `qa/project-context.md` | cases, screen |

Câu trả lời cuối của agent cũng liệt kê helper đã dùng lại và helper mới kèm lý do.

## Từ trạng thái

| Loại | Giá trị |
| --- | --- |
| Quyết định cho case | `ready` (đã rõ kết quả mong đợi), `proposed` (cần xác nhận nghiệp vụ), `blocked` (thiếu điều kiện), `manual`, `duplicate` |
| Coverage | `automated`, `partial`, `proposed`, `blocked`, `manual`, `duplicate`; phần tử màn hình có thêm `uncovered`, `reachability` |
| Kết quả chạy | `passed`, `failed`, `flaky` (chỉ pass sau khi retry), `skipped`, `expected-fail`, `blocked`, `not-run` |

`flaky` và `expected-fail` không bao giờ được tính là pass. `--list` hay compile thành công không chứng minh test đã pass.

## Chạy lại

Copy lệnh của case hoặc module từ runbook. Hướng dẫn này không ghi cứng lệnh Playwright vì config, project và package manager mỗi repo một khác.

## Kiểm tra chính các skill

`evals/README.md` có các kịch bản E1–E9b để kiểm tra agent có làm đúng skill không (không mock, lấy kết quả mong đợi từ case, dùng lại helper, dừng đúng checkpoint). Chạy trên bản copy sạch của `sample/` mỗi khi sửa skill hoặc đổi model, công cụ, và ghi kết quả vào đó.

## Sample

`sample/` là module Booking nhỏ có trang và HTTP service thật. `install.py` không copy nó vào dự án. Xem `sample/qa/e2e/booking.md` để biết lệnh chạy và kết quả gần nhất.
